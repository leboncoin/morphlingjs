#! /usr/bin/env node

import program from 'commander';

program
    .version('0.0.1')
    .description('CLI interface for Morphling')
    .command('apply <file>', 'Apply a Swagger to morphling').alias('a')
    .command('bash', 'Bash into the morphling container').alias('b')
    .command('config', 'Configure the morphling server').alias('c')
    .command('describe <filename>', 'Describe a morphling override').alias('d')
    .command('list', 'List files saved in morphling').alias('ls')
    .command('remove', 'Remove a Swagger file saved in Morphling').alias('rm')
    .command('remove-all', 'Clear Swagger files saved in Morphling').alias('rma')
    .command('restart', 'Restart the morphling server').alias('rr')
    .command('start', 'Start the morphling server on 8883 if no port is provided').alias('s')
    .command('stop', 'Stop the morphling server').alias('k')
    .command('toggle <filename>', 'Toggle an override').alias('t')

program.parse(process.argv);
