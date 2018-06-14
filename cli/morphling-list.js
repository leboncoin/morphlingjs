#! /usr/bin/env node

import program from 'commander';
import chalk from 'chalk';
import fetch from 'node-fetch';
import _ from 'lodash';
import Table from 'cli-table3';

import * as utilFunctions from './utils/util';

program
    .option('-v, --verbose', 'Print all the things')
    .option('-o --overrides', 'List overrides')
    .option('-p, --port <port>', 'A port number', parseInt)
    .parse(process.argv);

(async () => {
    try {
        let port;
        const config = await utilFunctions.returnConfigIfExists();

        if (config) {
            port = config.port;
        } else {
            port = program.port || 8883;
        }

        const listOverrides = !!program.overrides;
        const url = `http://localhost:${port}/morphling/list?list-overrides=${listOverrides}`;

        const request = await fetch(url)
        const { files } = await request.json();

        if (files.length === 0) {
            console.log(chalk.yellow(` 🤔 No ${!listOverrides ? 'swaggers' : 'overrides'} saved on morphling!`));
            return;
        }

        console.log(chalk.green(` 👇 ${!listOverrides ? 'Swaggers' : 'Overrides'} currently saved on Morphling:`));
        let table = new Table({ head: [chalk.blue('File name')] });

        _.each(files, (file) => {
            table.push([file]);
        })
        console.log(table.toString());

    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            console.log(chalk.red(` 😱 Connection to Morphling was refused. Is Morphling currently running?`));
        }
        console.log('Error in response', e);
    }
})()
