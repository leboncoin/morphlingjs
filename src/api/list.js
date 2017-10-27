import _ from 'lodash';

import koaRouter from 'koa-router'
import { checkFileExistence, readDir } from '../utils/utils'

const router = koaRouter();

router.get('/list', async (ctx) => {
    try {
        if (ctx.query.filename) {
            const fileExists = await checkFileExistence(`${process.cwd()}/src/data/${ctx.query.filename}`);
            ctx.body = fileExists ? { fileExists: true } : { fileExists: false };
        } else if (ctx.query['list-overrides'] === 'true') {
            const files = await readDir(`${process.cwd()}/src/data/`, (files) => {
                    return _.filter(files, file => file.includes('morphling-override'))
                        .map(file => file.replace('morphling-override-', ''))
                }
            );
            ctx.body = { files };
        } else {
            const files = await readDir(`${process.cwd()}/src/data/`, (files) => {
                return _.filter(files,
                    file => !file.includes('morphling-override') && !['db.json', '.gitkeep'].includes(file)
                );
            });
            ctx.body = { files };
        }
    } catch (e) {
        console.log('Error in get list', e);
    }
});

export default router;
