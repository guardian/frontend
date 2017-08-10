const exec = require('../../lib/exec-observable');

const legacyTests = ['common', 'facia'].map(set => ({
    description: `Run ${set} tests (legacy)`,
    task: () =>
        exec('karma', [
            'start',
            `./static/test/javascripts-legacy/conf/${set}.js`,
            '--single-run',
        ]),
}));

module.exports = {
    description: 'Test JS app',
    task: [
        require('../../compile/javascript/clean'),
        require('../../compile/javascript/copy'),
        require('../../compile/javascript/babel'),
        {
            description: 'Run tests',
            task: [
                {
                    description: 'JS tests in static/',
                    task: () => exec('jest'),
                },
                {
                    description: 'JS tests in ui/',
                    task: () => exec('jest', { cwd: 'ui' }),
                },
                ...legacyTests,
            ],
            concurrent: true,
        },
    ],
};
