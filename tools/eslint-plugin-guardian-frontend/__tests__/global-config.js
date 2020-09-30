const { RuleTester } = require('eslint');
const rule = require('../rules/global-config');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

ruleTester.run('global-config', rule, {
    valid: [
        'config.page',
        'config',
        'var config = 2',
        'foo.config',
        'foo.config.bar',
        'foo.guardian.config',
    ],

    invalid: [
        'var hello = guardian.config',
        'var hello = window.guardian.config',
        'var hello = loadscript(guardian.config)',
    ].map(code => ({
        code,
        errors: [
            {
                type: 'Identifier',
            },
        ],
    })),
});
