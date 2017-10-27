import Loki from 'lokijs'
import _ from 'lodash'

import * as collectionUtils from './collection'

export const MODEL_TABLE_NAME = 'models'
export const MODEL_NAME_FIELD = 'modelName'
export const FIXTURE_FILE_NAME = 'db.json'

let db;

/**
 * Initalizes the LokiJS database instance
 * @returns {Promise.<*>}
 */
export const getDB = () => {
    if (!db) {
        db = new Loki(`${process.cwd()}/src/data/${FIXTURE_FILE_NAME}`, {
            autosave: true,
            autosaveInterval: 100
        });
        db.save();
    }
    return db;
}

/**
 * Creates a model in database model collection if it does not exist
 * Also creates the model table if that table does not exist
 * @param db database instance
 * @param definition parsed swagger model definition
 * @returns {object} inserted model instance
 */
export const createModel = (db, definition) => {
    let modelCollection

    try {
        modelCollection = collectionUtils.findCollection(db, MODEL_TABLE_NAME)
    } catch (e) {
        if (e.message === 'MODEL_DOES_NOT_EXIST') {
            modelCollection = collectionUtils.createCollection(db, MODEL_TABLE_NAME, { unique: [MODEL_NAME_FIELD] })
        } else {
            console.error('Something went wrong while creating the models table.')
        }
    }

    let foundModel = collectionUtils.findOne(modelCollection, MODEL_NAME_FIELD, definition.modelName)

    if (!foundModel) {
        modelCollection.insert(definition);
        foundModel = collectionUtils.findOne(modelCollection, MODEL_NAME_FIELD, definition.modelName)
    }
    return foundModel;
}

/**
 * Ensure there are no duplicates in model names
 * @param models array of model names
 * @returns {Array}
 */
export const validateModelNames = (models) => {
    if (_.uniq(models).length !== _.keys(models).length) {
        console.warn('BEWARE, MODELS ARE DUPLICATED BETWEEN SWAGGERS. REMOVING DUPLICATES.');
    }
    return _.uniq(models);
}

/**
 * Get one model from DB
 * @param db
 * @param modelName
 */
export const getOneModel = (db, modelName) => {
    const modelTable = collectionUtils.findCollection(db, MODEL_TABLE_NAME)
    return collectionUtils.findOne(modelTable, MODEL_NAME_FIELD, modelName)
}
