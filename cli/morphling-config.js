#! /usr/bin/env node

import program from 'commander';
import prompt from 'prompt';
import chalk from 'chalk';
import promptProps from './utils/prompt-props';
import * as utilFunctions from './utils/util';
import { deleteConfigFile } from './utils/util';
import prettyjson from 'prettyjson';
import { returnConfigIfExists } from './utils/util'

program
    .option('-p, --port <port>', 'A port number', parseInt)
    .option('-v, --verbose', 'Print all the things')
    .option('-f, --force', 'Override existing config')
    .option('-d --delete', 'Delete existing configuration')
    .option('-s --show', 'Show existing configuration')
    .parse(process.argv);

(async () => {
    const configFileAlreadyExists = await utilFunctions.checkConfigFileExistence();

    if (program.delete) {
        try {
            await deleteConfigFile();
            console.log(`${chalk.green('Config deleted')}`)
        } catch (e) {
            if (e.code === 'ENOENT') {
                console.log(`${chalk.red(' 😱 Config file does not exist !')}`);
                console.log(`${chalk.blue(`${chalk.bold('morphling config')}`)} will walk you through the config`);
            } else {
                console.error(e);
            }
        }

        return;
    } else if (program.show) {
        try {
            const config = await returnConfigIfExists();
            console.log(' 👇 Current configuration');
            console.log('');
            console.log(prettyjson.render(config));
            console.log('');
        } catch(e) {
            if (e.code === 'ENOENT') {
                console.log(`${chalk.red(' 😱 Config file does not exist !')}`);
                console.log(`${chalk.blue(`${chalk.bold('morphling config')}`)} will walk you through the config`);
            } else {
                console.error(e);
            }
        }

        return;
    }

    prompt.start();
    prompt.message = promptProps.message;


    if (configFileAlreadyExists && !program.force) {
        console.log(chalk.red(` 😱 Config file already exists! Use ${chalk.bold('morphling config')} with -f to override the existing config.`));
        return;
    }

    prompt.get(promptProps.propertiesList.config, async (err, res) => {
        if (err) {
            console.log(err);
            return;
        }

        if (res.makeDefault) {

            const objectTosave = {
                port: res.port,
                default: res.makeDefault

            }
            try {
                await utilFunctions.writeConfigFile(objectTosave);

            } catch (e) {
                console.error('ERROR WHILE SAVING CONFIG', e);
                return;
            }
            console.log(chalk.green(` 🖖 Alright, Morphling will always run on ${res.port}!`));
            console.log(chalk.white(` 😉 You can change that by doing ${chalk.bold('morphling config')} again`));
            console.log(chalk.white(` 😉 Now start morphling by using ${chalk.bold('morphling start')}`));
        } else {
            console.log(chalk.green(` 🖖 Alright, Morphling will run on ${res.port}, but config will not be saved!`));
        }
    })
})();
