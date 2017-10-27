import _ from 'lodash';
import koaRouter from 'koa-router'
import { readDir, readFile, writeFile } from '../utils/utils'

const router = koaRouter();

router.get('/toggle', async (ctx) => {
    try {
        if (ctx.query['filename']) {
            const { filename } = ctx.query;
            let file = `${process.cwd()}/src/data/morphling-override-${filename}`;

            const fileToToggle = JSON.parse(await readFile(file));
            fileToToggle.overrideStatus = !fileToToggle.overrideStatus;

            await writeFile(`morphling-override-${filename}`, fileToToggle);

            ctx.body = { overrideStatus: fileToToggle.overrideStatus };
        } else if (ctx.query['enable']) {
            const trueIfEnableAll = ctx.query['enable'] === 'all';

            const files = await readDir(`${process.cwd()}/src/data/`, (files) => {
                return _.filter(files,
                    file => file.includes('morphling-override')
                );
            });

            await Promise.all(
                _.map(files, async (file) => {
                    const fileToToggle = JSON.parse(await readFile(`${process.cwd()}/src/data/${file}`));
                    fileToToggle.overrideStatus = trueIfEnableAll;
                    return await writeFile(file, fileToToggle);
                })
            );

            ctx.body = { overrideStatus: trueIfEnableAll };
        } else {
            ctx.throw(404);
        }
    } catch (e) {
        ctx.throw(e);
    }
});

export default router;
