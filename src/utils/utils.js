import fs from 'fs'
import _ from 'lodash';

/**
 * Read file content in path
 * @param path
 * @returns {Promise}
 */
export const readFile = async (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        })
    });
}
/**
 * Write file in path from other file
 * @returns {Promise}
 * @param fileName
 * @param file
 */
export const writeFileStream = async (fileName, file) => {
    try {
        const readStream = fs.createReadStream(file.path);
        const writeStream = fs.createWriteStream(`${process.cwd()}/src/data/${fileName}`);
        readStream.pipe(writeStream);
        fs.unlink(file.path);

        return await readFile(`${process.cwd()}/src/data/${fileName}`);
    } catch (e) {
        console.log('Error while writing file!', e);

    }
}

/**
 * Write file in path
 * @param filename file name
 * @param content JSON object
 * @returns {Promise}
 */
export const writeFile = async (filename, content) => {
    const contentToWrite = _.isObject(content) ? JSON.stringify(content) : content;
    return new Promise(function (resolve, reject) {
        fs.writeFile(`${process.cwd()}/src/data/${filename}`, contentToWrite, 'utf8', (err, res) => {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        });
    });
}

/**
 * check if file exists
 * @returns {Promise}
 * @param path
 */
export const checkFileExistence = async (path) => {
    return new Promise((resolve) => {
        fs.stat(path, (e) => {
            if (e) return resolve(false)
            return resolve(true)
        })
    });
}

/**
 * Read directory file names
 * @param path path to directory
 * @param exclude files to filter out of exit
 * @returns {Promise} resolved filenames
 */
export const readDir = async (path, exclude) => {
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err) {
                return reject(err);
            }

            if (exclude) {
                if (typeof exclude === 'function') {
                    return resolve(exclude(files))
                }

                return resolve(
                    _.filter(files, file => !exclude.includes(file))
                );

            }

            return resolve(files);
        })
    });
}
