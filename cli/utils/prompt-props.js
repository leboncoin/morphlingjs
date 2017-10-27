import chalk from 'chalk';

export default {
    message: chalk.green('Morphling'),
    propertiesList: {
        config: [
            {
                name: 'port',
                type: 'integer',
                description: chalk.white('On which port do you want to run Morphling?'),
                default: 8883,
            },
            {
                name: 'makeDefault',
                type: 'string',
                required: true,
                description: chalk.white('Do you want to save that as the default morphling port (y/n)?'),
                pattern: /[yn]/,
                default: 'y',
                before:(value)=> value === 'y'
            }
        ],
        start: [
            {
                name: 'run',
                type: 'boolean',
                required: true,
                description: chalk.white(`You're done! Wanna run Morphling now?`)
            }
        ]
    }
}
