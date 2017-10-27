export default async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        // will only respond with JSON
        ctx.status = err.code || 500;

        ctx.body = {
            message: err.message
        };
    }
}
