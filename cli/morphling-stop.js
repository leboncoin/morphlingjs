#! /usr/bin/env node

import program from 'commander';
import shell from 'shelljs';
import chalk from 'chalk';
import * as utilFunctions from './utils/util'
import { getInstalledPath } from 'get-installed-path'

program
    .option('-v, --verbose', 'Print all the things')
    .option('-p, --port <port>', 'A port number', parseInt)
    .parse(process.argv);

(async () => {
    let port;
    const config = await utilFunctions.returnConfigIfExists();

    if (config) {
        console.log(chalk.white('Starting morphling using config file...'))
        port = config.port;
    } else {
        port = program.port || 8883;
    }

    const verbose = program.verbose || false;

    if (!shell.which('docker')) {
        console.log(chalk.red(` 😱 Morphling requires docker to be able to run. 😱 `))
        shell.exit(1);
    }

    if (!shell.which('docker-compose')) {
        console.log(chalk.red(` 😱 Morphling requires docker-compose to be able to run. 😱 `))
        shell.exit(1);
    }
    const installedPath = await getInstalledPath('morphlingjs');

    if (!verbose) {
        shell.exec(`cd ${installedPath} && cross-env NODE_PORT=${port} docker-compose stop > /dev/null 2>&1`);
    } else {
        shell.exec(`cd ${installedPath} && cross-env NODE_PORT=${port} docker-compose stop`)
    }

    console.log(chalk.green(`Morphling instance was killed 🖖`));
})()
