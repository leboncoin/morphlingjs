#! /usr/bin/env node

import program from 'commander';
import shell from 'shelljs';
import chalk from 'chalk';
import * as utilFunctions from './utils/util'
import { getInstalledPath } from 'get-installed-path'

export const restartAction = async () => {
    const config = await utilFunctions.returnConfigIfExists();
    const port = config.port || program.port || 8883;
    const verbose = program.verbose || false;

    if (!shell.which('docker')) {
        console.log(chalk.red(` 🖕 Morphling requires docker to be able to run.`))
        shell.exit(1);
    }

    if (!shell.which('docker-compose')) {
        console.log(chalk.red(` 🖕 Morphling requires docker-compose to be able to run.`))
        shell.exit(1);
    }

    const installedPath = await getInstalledPath('morphlingjs');

    if (!verbose) {
        if(!process.env.DEV){
            shell.exec(`export NODE_PORT=${port} && cd ${installedPath} && docker-compose restart > /dev/null 2>&1`);
        } else {
            shell.exec(`export NODE_PORT=${port} && docker-compose restart > /dev/null 2>&1`);
        }
    } else {
        if(!process.env.DEV){
            shell.exec(`export NODE_PORT=${port} && cd ${installedPath} && docker-compose restart`);
        } else {
            shell.exec(`export NODE_PORT=${port} && docker-compose up restart`);
        }
    }

    console.log(chalk.green(` 🖖 Morphling successfully restarted on ${port}`));
};

program
    .option('-p, --port <port>', 'A port number', parseInt)
    .option('-v, --verbose', 'Print all the things')
    .parse(process.argv);
