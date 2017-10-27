#! /usr/bin/env node

import program from 'commander';
import shell from 'shelljs';
import chalk from 'chalk';

program
    .option('-v, --verbose', 'Print all the things')
    .option('-p, --port <port>', 'A port number', parseInt)
    .parse(process.argv);
