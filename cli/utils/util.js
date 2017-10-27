import fs from 'fs';
import { getInstalledPath } from 'get-installed-path';

const env = process.env.DEV ? '' : '/bin';

export const writeConfigFile = async (objectToWrite) => {
    const installedPath = await getInstalledPath('morphlingjs');
    const path = `${installedPath}${env}/cli/morphling-config.json`;

    return new Promise(function (resolve, reject) {
        fs.writeFile(path, JSON.stringify(objectToWrite), function (err) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            return resolve();
        });
    });
}

export const deleteConfigFile = async () => {
    const installedPath = await getInstalledPath('morphlingjs');
    const path = `${installedPath}${env}/cli/morphling-config.json`;

    return new Promise(function (resolve, reject) {
        fs.unlink(path, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        });
    });
}

export const checkConfigFileExistence = async () => {
    const installedPath = await getInstalledPath('morphlingjs');
    const path = `${installedPath}${env}/cli/morphling-config.json`;

    return new Promise((resolve) => {
        fs.stat(path, (e) => {
            if (e) return resolve(false)

            return resolve(true)
        })
    });
}

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

export const returnConfigIfExists = async () => {
    const installedPath = await getInstalledPath('morphlingjs');
    const path = `${installedPath}${env}/cli/morphling-config.json`;

    return (await checkConfigFileExistence()) ? JSON.parse(await readFile(path)) : false;
}

export const parseFile = async () => {
    try {
        const fileContent = await readFile(path);
        const parsedFile = overrideFileParser(fileContent);
    } catch (e) {
        console.log(e);
    }
}

export const overrideFileParser = async (file) => {
    let fileContent;

    try {
        fileContent = JSON.parse(file);
    } catch (e) {
        return Promise.reject('UNPARSED_JSON')
    }

    if (!fileContent.route) {
        return Promise.reject(new Error('NO_ROUTE_DEFINED'));
    }
    if (!fileContent.method) {
        return Promise.reject(new Error('NO_METHOD_DEFINED'));
    }
    if (!fileContent.exitHttpCode) {
        return Promise.reject(new Error('NO_HTTP_CODE_DEFINED'));
    }

    return fileContent;
}
