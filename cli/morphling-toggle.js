#! /usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import fetch from 'node-fetch';

import * as utilFunctions from './utils/util'

const toggleAction = async (filename) => {
    try {
        let port;

        const config = await utilFunctions.returnConfigIfExists();

        if (config) {
            port = config.port;
        } else {
            port = program.port || 8883;
        }

        let url = `http://localhost:${port}/morphling/toggle`;

        if (program.enableAll) {
            url += '?enable=all';
        } else if (program.disableAll) {
            url += '?enable=none';
        } else {
            url += `?filename=${filename}`;
        }

        const request = await fetch(url);
        const res = await request.json();

        const status = res.overrideStatus ? chalk.green('ON') : chalk.red('OFF');
        if (program.enableAll || program.disableAll) {
            console.log(` 👍 All overrides are now ${status}`);
        } else {
            console.log(` 👍 Override ${filename} is now ${status}`);
        }

    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            console.log(chalk.red(` 😱 Connection to Morphling was refused. Is Morphling currently running?`));
            return;
        }
    }
}

program
    .action(toggleAction)
    .option('-p, --port <port>', 'A port number', parseInt)
    .option('-v, --verbose', 'Print all the things')
    .option('-e, --enable-all', 'Enable all overrides')
    .option('-d, --disable-all', 'Disable all overrides')
    .parse(process.argv);

if (program.args.length === 0 && !program.enableAll && !program.disableAll) {
    console.log(chalk.red(` 😱 No filename provided. Use ${chalk.bold('morphling list -o')} to list all overrides`));
}

if (program.enableAll || program.disableAll) {
    (async () => {
        try {
            await toggleAction()
        } catch (e) {
        }
    })()
}
