import { getDB } from '../../db/index'

export default async(ctx, next)=> {
    try {
        ctx.db = getDB()
        await next();
    } catch(e) {
        console.log('Error in getDB', e);

    }

}
