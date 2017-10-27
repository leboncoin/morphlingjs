import koaRouter from 'koa-router'
import _ from 'lodash'
import { readDir, readFile } from './utils'

const SOURCE_FILES_LOCATION = `${process.cwd()}/src/data`;

/**
 * Create a router for a given override file
 *
 * The route is created during the boot, but we check again
 * the override status during the request, to have working toggle
 *
 * @param name
 * @param overrideContent
 * @returns {*}
 */
const createRouter = (name, overrideContent) => {
    const router = koaRouter();

    const { httpCode, body, route, method } = JSON.parse(overrideContent);
    const lowerCasedMethod = method.toLowerCase();

    router[lowerCasedMethod](route, async (ctx) => {
        console.log('pass');

        const { overrideStatus } = JSON.parse(await readFile(`${SOURCE_FILES_LOCATION}/${name}`));

        if(overrideStatus){
            ctx.body = _.keys(body).length > 0 ? body : null;
            ctx.status = httpCode;
        }
    });

    return router;
}

/**
 * Read override files in data directory and return an array of koa routers ready for use
 * @returns {Promise.<*[]>}
 */
export default async () => {
    try {
        const overrideFiles = await readDir(SOURCE_FILES_LOCATION, (files) => {
            return _.filter(files, file => file.includes('morphling-override'));
        });

        return await Promise.all(
            _.map(overrideFiles, async (fileName) => {
                const fileContent = await readFile(`${SOURCE_FILES_LOCATION}/${fileName}`);
                return createRouter(fileName, fileContent)
            })
        )
    } catch (e) {
        console.error(e);
    }
}
