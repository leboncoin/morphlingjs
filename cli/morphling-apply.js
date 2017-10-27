#! /usr/bin/env node

import program from 'commander';
import FormData from 'form-data';
import chalk from 'chalk';
import fetch from 'node-fetch';
import fs from 'fs';
import * as utilFunctions from './utils/util'
import { restartAction } from './morphling-restart';

const applyAction = async (dir) => {
    try {
        const config = await utilFunctions.returnConfigIfExists();
        const port = config.port || program.port || 8883;
        const isOverrideFile = program.override || false;
        const url = `http://localhost:${port}`;
        const splitDir = dir.split('/');
        const filename = splitDir[splitDir.length - 1];
        const filenameForOverride = isOverrideFile ? `morphling-override-${filename}` : filename;

        const listUrl = `${url}/morphling/list?filename=${filenameForOverride}`;

        const request = await fetch(listUrl);
        const { fileExists } = await request.json();

        if (!fileExists || program.force) {
            console.log(chalk.green(`Applying '${chalk.bold(filename)}' to Morphling ...`));

            const form = new FormData();

            form.append('file', fs.createReadStream(`${process.cwd()}/${dir}`));
            form.append('fileName', filenameForOverride);

            await fetch(`${url}/morphling/apply${isOverrideFile ? '?override=true' : ''}`, {
                method: 'POST',
                body: form,
            });
            console.log(chalk.green(`${isOverrideFile ? 'Override file' : 'File'} '${chalk.bold(filename)}' successfully uploaded! Restarting...`));
            await restartAction();
        } else {
            console.log(chalk.red(`${isOverrideFile ? 'Override file' : 'File'} '${chalk.bold(filename)}' already exists on Morphling. Type morphling apply with -f to force.`));
        }
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            console.log(chalk.red(`Connection to Morphling was refused. Is Morphling currently running?`));
        }
    }
}


program
    .action(applyAction)
    .option('-p, --port <port>', 'A port number', parseInt)
    .option('-v, --verbose', 'Print all the things')
    .option('-f, --force', 'Erase file that might already exist')
    .option('-o --override', 'Apply a custom override to morphling')
    .parse(process.argv);
