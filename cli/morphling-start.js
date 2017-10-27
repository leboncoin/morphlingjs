#! /usr/bin/env node

import program from 'commander';
import shell from 'shelljs';
import chalk from 'chalk';

import * as utilFunctions from './utils/util';
import { getInstalledPath } from 'get-installed-path'

program
    .option('-p, --port <port>', 'A port number', parseInt)
    .option('-v, --verbose', 'Print all the things')
    .parse(process.argv);

(async () => {
    let port;
    const verbose = program.verbose || false;

    const config = await utilFunctions.returnConfigIfExists();

    if (config) {
        console.log(chalk.white('Starting morphling using config file...'))
        port = config.port;
    } else {
        port = program.port || 8883;
    }

    if (!shell.which('docker')) {
        console.log(chalk.red(` 😱 Morphling requires docker to be able to run. 😱 `))
        shell.exit(1);
    }

    if (!shell.which('docker-compose')) {
        console.log(chalk.red(` 😱 Morphling requires docker-compose to be able to run. 😱 `))
        shell.exit(1);
    }

    const installedPath = await getInstalledPath('morphlingjs');

    console.log(`export NODE_PORT=${port} && cd ${installedPath} && docker-compose up -d > /dev/null 2>&1`);

    if (!verbose) {
        if(!process.env.DEV){
            shell.exec(`export NODE_PORT=${port} && cd ${installedPath} && docker-compose up -d > /dev/null 2>&1`);
        } else {
            shell.exec(`export NODE_PORT=${port} && docker-compose up -d > /dev/null 2>&1`);
        }
    } else {
        if(!process.env.DEV){
            shell.exec(`export NODE_PORT=${port} && cd ${installedPath} && docker-compose up -d`);
        } else {
            shell.exec(`export NODE_PORT=${port} && docker-compose up -d`);
        }
    }

    console.log(chalk.green(` 🖖 Morphling started on ${port}`));
})()

