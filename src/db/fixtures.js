import _ from 'lodash'
import faker from 'faker'

import { getOneModel, createModel } from './index'
import { createCollection, findCollection, insertOne } from './collection'

/**
 * Create all fixtures from a given list of parsed swagger definitions
 * @param db A LokiJS DB instance
 * @param definitions A list of parsed swagger definitions
 */
export const createFixturesFromDefinitions = (db, definitions) => {
    try {
        const createdModels = _.map(definitions, definition => {
            // store all models in datase
            return createModel(db, definition)
        })

        // after all models are stored in database, we can start to generate fixtures for all
        // since we have all references stored

        return _.map(createdModels, model => {
            const fixtures = _.map(_.range(5), iter => generateOneFixture(db, model));

            const { modelName } = model;
            let currentModelCollection;

            try {
                currentModelCollection = findCollection(db, modelName)
            } catch (e) {
                if (e.message === 'MODEL_DOES_NOT_EXIST') {
                    currentModelCollection = createCollection(db, modelName)
                }
            }

            return currentModelCollection.insert(fixtures)
        })
    } catch (e) {
        console.error(e);
    }
}

/**
 * Create one fixture from a given model
 * @param db Loki DB instance
 * @param model model content
 * @returns {{}}
 */
const generateOneFixture = (db, model) => {
    console.log(model);

    const { type, modelName } = model;

    switch (type) {
        case 'object':
            const { properties } = model;
            //handle dictionnaries (additonalProperties instead of properties)
            if (!properties) {
                const fixture = {}

                //TODO handle maps or object with additionalProperties here

                return fixture;
            } else {
                const fixture = {};
                fixture[modelName] = _.reduce(properties, (acc, prop, propName) => generate(db, acc, prop, propName, modelName), {})
                return fixture;
            }
            break;
        case 'array':
            const fixture = {}
            fixture[modelName] = _.map(_.range(5), (elem) => generate(db, {}, model.items, modelName)[modelName]);
            return fixture
            break;
        default:
            throw new Error('Non handled generable type', { model, type })
            break;
    }
}

/**
 * Get reference model name from reference string
 * @param {string} item
 */
const cleanPropertyReference = (item) => {
    return item.replace(`#/definitions/`, '')
};

/**
 * Generate one fixture
 * @param db
 * @param accumulator
 * @param property
 * @param propertyName
 * @param parentModelName
 * @returns {*}
 */
const generate = (db, accumulator, property, propertyName, parentModelName) => {
    accumulator[propertyName] = accumulator[propertyName] ? accumulator[propertyName] : {}
    const mapping = {
        'integer': faker.random.number,
        'number': faker.random.number,
        'string': faker.random.word,
        'boolean': faker.random.boolean,
    }

    //TODO make sure that we handle enum fields with non-random values

    const customMapping = {
        'array': (property, propertyName) => {
            const { items } = property;

            //handle case where array is an array of references to another object
            //we get the model from database and then generate from it;
            if (items['$ref']) {
                //TODO chain 5 times
                const modelName = cleanPropertyReference(items['$ref']);
                const model = getOneModel(db, modelName);

                // if the current parsed model is the same than its container it is a circular reference
                if (modelName === parentModelName) {
                    return 'MORPHLING_CIRCULAR_REFERENCE'
                }

                return _.map(_.range(5), elem => generateOneFixture(db, model));
            }
            //else we just generate an array of fixtures
            return _.map(_.range(5), elem => generate(db, {}, items, propertyName)[propertyName]);
        },
        'lat': faker.address.latitude,
        'lng': faker.address.longitude,
        'zipcode': faker.address.zipCode,
        'address': faker.address.streetAddress,
    }

    const fakerGenerators = {
        ...faker.random,
        ...faker.address,
        ...faker.company,
        ...faker.finance,
        ...faker.internet,
        ...faker.name,
        ...faker.random,
    };

    //it is a reference to another object, keep reference for further generation down the line
    if (property['$ref']) {
        const modelName = cleanPropertyReference(property['$ref']);
        const model = getOneModel(db, modelName);

        //console.log(generateOneFixture(db, model));
        accumulator[propertyName] = generateOneFixture(db, model);
    }
    // else a manual override exists for a given property
    else if (customMapping[propertyName]) {
        accumulator[propertyName] = customMapping[propertyName]();
    }
    //else a faker generator with the same name exists (using it will give more realistic data)
    else if (fakerGenerators[propertyName]) {
        accumulator[propertyName] = fakerGenerators[propertyName]();
    }
    //else use property type to generate the data
    else if (mapping[property.type]) {
        accumulator[propertyName] = mapping[property.type]();

    }
    //else object is an array, we need to recure to generate
    else if (property.type === 'array') {
        accumulator[propertyName] = customMapping['array'](property, propertyName);
    }
    //keep property as is if no field where generation could be done was found
    else {
        //TODO maybe example ?
        accumulator[propertyName] = property;
    }

    return accumulator;
}
