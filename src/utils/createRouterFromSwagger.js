import koaRouter from 'koa-router'
import _ from 'lodash'
import { findCollection } from '../db/collection'

/**
 * Put all the other stuff down there together
 *
 * @param db
 * @param basePath
 * @param paths
 * @returns {*}
 */
export default (db, { basePath, paths }) => {
    //remove last slash of route if there is one
    const cleanedBasePath = basePath[basePath.length - 1] !== '/' ? basePath : basePath.slice(0, -1);

    //create router container
    let router = koaRouter({
        prefix: cleanedBasePath || ''
    })

    _.each(paths, (pathOptions, route) => {
        //get methods without parameters
        const routerMethods = _.compact(_.map(_.keys(pathOptions), key => key !== 'parameters' ? key : null))

        // mount methods to router if it has any
        if (routerMethods.length) {
            router = addMethodsToRouter(db, router, { route, routerMethods, pathOptions })
        }
    })

    return router
}

/**
 * Add methods + bind callbacks to the router + bind parameters
 * @param db
 * @param router
 * @param route
 * @param routerMethods
 * @param pathOptions
 * @returns {*}
 */
const addMethodsToRouter = (db, router, { route, routerMethods, pathOptions }) => {
    const formattedRouteParameters = createAliasesForParameters(route)
    const formattedRoute = _.reduce(formattedRouteParameters, (acc, elem) => {
        return acc.replace(elem.name, `:${elem.alias}`).replace(/[{}]/g, '')
    }, route)

    let routerRef = router

    _.each(routerMethods, (method) => {
        //create route
        const { responses, parameters } = pathOptions[method]
        const getter = responseGetter(db, responses);

        router[method](formattedRoute, getter);

        //add parameters link to route if there are any to add
        if (formattedRouteParameters) {
            const swaggerOptions = _.filter(pathOptions[method].parameters, { in: 'path' })
            router = addUrlParamToRouter(router, formattedRouteParameters, swaggerOptions)
        }

        //add handlers to route

    })

    return routerRef
}

/**
 * Create route callback function, defining randomly how many fixtures we will return
 * and which one exactly from the local db
 *
 * @param db
 * @param responses
 * @returns {function(*)}
 */
const responseGetter = (db, responses) => {
    let body;
    const defaultSuccess = responses[200] || responses[201] || responses[204];

    return ((ctx) => {
        if (defaultSuccess && defaultSuccess.schema) {
            const objectRef = getReferencesAndCount(defaultSuccess.schema);
            const collection = findCollection(db, objectRef.object);

            body = _.take(
                _.shuffle(
                    _.map(
                        collection.find(),
                        `${objectRef.object}`
                    )
                )
                , objectRef.fixtureCount);
            if (defaultSuccess.schema.type === 'array') {
                ctx.body = body;
            }
            else if (defaultSuccess.schema['$ref']) {
                ctx.body = body[0];
            }
            return;
        } else if (defaultSuccess) {
            const possibleCodes = [200, 201, 204];
            for (const code of possibleCodes){
                if(responses[code]){
                    ctx.status = code;
                    break;
                }
            }
            return;
        }
        ctx.throw('Unsupported format! Can you create an issue in Github about that?')

    });

    //2 handle parameters in body (in: body)
    //  -> is body required ?
    //  -> validate against schema
    //3 define if should give success or error through override
    //  -> if so, do return error from schema
    //4 get smallest response code and accept it as default one
}

/**
 * Get the fixture that should be return + a random number
 *
 * @param reference
 * @returns {{fixtureCount: number, object}}
 */
const getReferencesAndCount = (reference) => {
    if (reference['$ref']) {
        const object = reference['$ref'].replace('#/definitions/', '');
        return { fixtureCount: 1, object }
    } else if (reference.items) {
        const object = reference.items['$ref'].replace('#/definitions/', '');
        return { fixtureCount: (Math.round(Math.random() * 5)) || 1, object }
    } else {
        return { fixtureCount: 0, object: reference.description }
    }
}

/**
 * Format parameters
 *
 * @param route
 * @returns {*}
 */
const createAliasesForParameters = (route) => {
    const urlParams = route.match(/{(.*)}/g)

    return _.reduce(urlParams, (acc, param) => {
        const rawParameter = param.replace(/[{}]/g, '')

        if (!acc[rawParameter]) {
            acc[rawParameter] = {
                name: rawParameter,
                alias: param.replace(/\-/g, '')
            }
        }
        return acc
    }, {})
}

/**
 * Binds parameters to the router so they can be correctly recognized on query
 * @param router
 * @param formattedRouteParameters
 * @param swaggerOptions
 * @returns {*}
 */
const addUrlParamToRouter = (router, formattedRouteParameters, swaggerOptions) => {
    const routerRef = router

    _.each(formattedRouteParameters, ({ name }) => {
        //get details of parameter (required, type...)
        const swaggerOptionsForParameter = _.find(swaggerOptions, { name });

        routerRef.param(name, async (value, ctx, next) => {
            //check that parameter exists
            if (swaggerOptionsForParameter.required) {
                if (!value) {
                    return ctx.throw(`Parameter ${name} is missing`)
                }
            }
            return next()
        })
    })

    return routerRef
}
