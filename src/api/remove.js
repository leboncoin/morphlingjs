import koaRouter from 'koa-router'

const router = koaRouter();

router.delete('/remove', async (ctx) => {
    ctx.body = 'OK'
});

export default router;



