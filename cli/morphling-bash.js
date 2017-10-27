#! /usr/bin/env node

import program from 'commander';
import shell from 'shelljs';
import chalk from 'chalk';
import _ from 'lodash';
import childProcess from 'child_process';

program
    .parse(process.argv);

console.log(chalk.white('Container ID is:'));

shell.exec('docker ps --filter "name=morphlingjs_web" -q', (code, stdout, stderr) => {
    if (stderr) {
        console.log(stderr);
    } else {
        console.log(chalk.white(`Bashing into Morphling.. Type ${chalk.bold('exit')} to exit.`));
        childProcess.spawnSync('docker', ['exec', '-it', _.trim(stdout), 'bash'], {
            stdio: 'inherit'
        })
    }
})
