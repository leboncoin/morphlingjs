#! /usr/bin/env node

import _ from 'lodash';
import program from 'commander';
import chalk from 'chalk';
import fetch from 'node-fetch'
import Table from 'cli-table3';

import * as utilFunctions from './utils/util'
import * as util from 'util'
import prettyjson from 'prettyjson'

const describeAction = async (filename) => {
    try {
        let port;
        const config = await utilFunctions.returnConfigIfExists();

        if (config) {
            port = config.port;
        } else {
            port = program.port || 8883;
        }

        const url = `http://localhost:${port}/morphling/describe?filename=${filename}`;

        const request = await fetch(url)
        if (request.status === 404) {
            console.log(chalk.red(` 😱 File was not found. Use ${chalk.bold('morphling list -o')} to list all overrides`));
            return;
        }

        const res = await request.json();

        let table = new Table({
            head: [
                chalk.blue('Method'),
                chalk.blue('Route'),
                chalk.blue('Code'),
                chalk.blue('Empty Response?'),
                chalk.blue('Enabled'),
            ]
        });
        const bodyIsEmpty = _.keys(res.body).length === 0;
        console.log('');

        console.log(`Description for override ${chalk.bold(filename)}`);

        table.push([
            res.method,
            res.route,
            res.httpCode,
            bodyIsEmpty ? 'Yes' : 'No',
            res.overrideStatus ? chalk.green('ON') : chalk.red('OFF'),
        ]);

        console.log(table.toString());

        if (!bodyIsEmpty && !program.withBody && !program.withBodyRaw) {
            console.log(chalk.blue(`Use ${chalk.bold('morphling describe -b <filename>')} to display the body`))
        }

        if (program.withBody || program.withBodyRaw) {
            if (bodyIsEmpty) {
                console.log(chalk.red(` 😱 Body is empty!`));
            } else {
                console.log('');
                if (!program.withBodyRaw) {
                    console.log(' 👇 Prettified body:');
                    console.log('');
                    console.log(prettyjson.render(res.body));
                    console.log('');

                } else {
                    console.log(' 👇 Raw body:');
                    console.log('');
                    console.log(util.inspect(res.body, { depth: null, colors: true }))
                    console.log('');
                }
            }
        }
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            console.log(chalk.red(` 😱 Connection to Morphling was refused. Is Morphling currently running?`));
        }
        console.error(e);
    }
}

program
    .action(describeAction)
    .option('-p, --port <port>', 'A port number', parseInt)
    .option('-v, --verbose', 'Print all the things')
    .option('-b, --with-body', 'Pretty-print the body')
    .option('-r, --with-body-raw', 'Print the body as-is')
    .parse(process.argv);

if (program.args.length === 0) {
    console.log(chalk.red(` 😱 No filename provided. Use ${chalk.bold('morphling list -o')} to list all overrides`));
}
