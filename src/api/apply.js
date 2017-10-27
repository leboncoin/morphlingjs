import koaRouter from 'koa-router'
import koaBody from 'koa-body'
import { writeFileStream, writeFile } from '../utils/utils'

const router = koaRouter();

router.post('/apply', koaBody({
    multipart: true, formidable: { uploadDir: `${process.cwd()}/src/data` }
}), async (ctx) => {
    try {
        const { fields, files } = ctx.request.body;
        const { fileName } = fields;
        const { file } = files;

        const writtenFile = await writeFileStream(fileName, file);

        if (ctx.query.override && ctx.query.override === 'true') {
            const overridenFile = JSON.parse(writtenFile);
            //TODO give an option in the cli to immediately enable
            overridenFile.overrideStatus = false;
            await writeFile(`${fileName}`, JSON.stringify(overridenFile));
        }

        ctx.statusCode = 200;
    } catch (e) {
        console.error(e);
        ctx.throw(500);
    }
});

export default router;



