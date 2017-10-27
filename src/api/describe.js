import koaRouter from 'koa-router'
import { readFile } from '../utils/utils'

const router = koaRouter();

router.get('/describe', async (ctx) => {
    try {
        if (!ctx.query['filename']) {
            return ctx.throw(new Error('NOT_FOUND'))
        }
        const { filename } = ctx.query;

        let fileDir = `${process.cwd()}/src/data/morphling-override-`

        ctx.body = await readFile(`${fileDir}${filename}`);
    } catch (e) {
    }
});

export default router;


