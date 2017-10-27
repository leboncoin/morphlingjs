import Koa from 'koa'
import _ from 'lodash';

import apiRouter from './api'
import errorMiddleware from './api/middleware/error'
import lokiMiddleware from './api/middleware/loki'
import Morphling from './utils/morphling';
import overrideRouter from './utils/override-router';

const serverPort = process.env.NODE_PORT || 8883;

(async () => {
    const app = new Koa()

    app.use(errorMiddleware)
    app.use(lokiMiddleware)

    app.use(apiRouter.routes(), apiRouter.allowedMethods())

    try {
        const overrideRouters = await overrideRouter();
        _.map(overrideRouters, (router)=>{
            app.use(router.routes(), router.allowedMethods());
        });

        const morphlingInstance = await Morphling();
        _.map(morphlingInstance, (router)=>{
            app.use(router.routes(), router.allowedMethods());
        });
    } catch(e) {
        console.error(e);
    }

    app.on('error', (err, ctx) => {
        console.error('server error', err, ctx)
    })

    app.listen(serverPort)
    console.log(`Morphling ready on port ${serverPort}`)
})()

