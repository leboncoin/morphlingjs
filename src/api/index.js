import koaRouter from 'koa-router'

import morphlingApply from './apply'
import morphlingList from './list'
import morphlingRemove from './remove'
import morphlingRemoveAll from './remove-all'
import morphlingDescribe from './describe'
import morphlingToggle from './toggle'

const router = koaRouter({ prefix: '/morphling' })



router
    .use(morphlingApply.routes(), morphlingApply.allowedMethods())
    .use(morphlingList.routes(), morphlingList.allowedMethods())
    .use(morphlingRemove.routes(), morphlingRemove.allowedMethods())
    .use(morphlingRemoveAll.routes(), morphlingRemoveAll.allowedMethods())
    .use(morphlingDescribe.routes(), morphlingDescribe.allowedMethods())
    .use(morphlingToggle.routes(), morphlingToggle.allowedMethods());

export default router;
