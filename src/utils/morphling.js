import _ from 'lodash'
import swaggerParser from 'swagger-parser'
import YAML from 'yamljs'

import { getDB, validateModelNames } from '../db'
import { createFixturesFromDefinitions } from '../db/fixtures'
import createRouterFromSwagger from './createRouterFromSwagger'
import { readDir, readFile } from './utils'

const SOURCE_FILES_LOCATION = `${process.cwd()}/src/data`;

/**
 * Read swagger files in data directory and pass them to the fixture + routes creator
 * @returns {Promise.<void>}
 */
export default async () => {
    try {
        const localSources = await readDir(SOURCE_FILES_LOCATION, (files) => {
            return _.filter(files,
                file => !file.includes('morphling-override') && !['db.json', '.gitkeep'].includes(file)
            );
        });

        const swaggers = await Promise.all(
            _.map(localSources, async (fileName) => {
                const fileContent = await readFile(`${SOURCE_FILES_LOCATION}/${fileName}`);
                if (fileName.includes('.json')) {
                    return JSON.parse(fileContent);
                } else if (fileName.includes('.yml') || fileName.includes('.yaml')) {
                    return YAML.parse(fileContent)
                }
            })
        )
        return await Morphling(swaggers);
    } catch (e) {
        console.log('Error while fetching local swaggers', e);

    }
}

/**
 * Takes an array of swaggers in, returns a router with bound fixtures out
 * @param swaggers
 * @returns {Promise.<void>}
 * @constructor
 */
const Morphling = async (swaggers) => {
    const db = getDB()

    try {
        const parsedSwaggers = await Promise.all(
            _.map(swaggers, (elem) => {
                return parseSwagger(elem)
            }));


        const allModelDefinitions = _.merge(..._.map(parsedSwaggers, (swagger) => {
            return _.map(swagger.definitions, (def, defName) => ({ modelName: defName, ...def }))
        }));


        const cleanedModelDefinitions = validateModelNames(allModelDefinitions);

        const fixtures = createFixturesFromDefinitions(db, cleanedModelDefinitions);

        return _.map(swaggers, (source) => {
            const { basePath, paths, } = source;
            return createRouterFromSwagger(db, { basePath, paths })
        })
    } catch (e) {
        console.error(e)
    }
}

/**
 * Swagger parser, dont not parse circular references because JSON cannot handle that
 * @param source
 * @returns {Promise.<*>}
 */
const parseSwagger = async (source) => {
    return await swaggerParser.bundle(source, { $refs: { circular: 'ignore' } });
}

