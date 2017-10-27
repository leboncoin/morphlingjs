export const findOne = (collection, value, eq) => {
    const query = {};
    query[value] = { '$eq': eq }
    return collection.find(query)[0]
}

/**
 * Creates a collection in database
 * @param db database instance
 * @param modelName name of model
 * @param opts other options (See lokiJS docs)
 * @returns {Collection|*}
 */
export const createCollection = (db, modelName, opts) => {
    const entries = db.getCollection(modelName);
    if (entries) {
        throw new Error('Collection already exists');
    }

    return db.addCollection(modelName, opts)
}

/**
 * Get collection from database
 * @param db database instance
 * @param modelName
 * @returns {Collection}
 */
export const findCollection = (db, modelName) => {
    const entries = db.getCollection(modelName);

    if (!entries) {
        throw new Error('MODEL_DOES_NOT_EXIST')
    }

    return entries;
}

