const { RuleTester } = require('eslint');
const rule = require('../rules/no-direct-access-config');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

ruleTester.run('no-direct-access-config', rule, {
    valid: ['config', 'config.get()'],

    invalid: ['config.page', 'config.page.keywordIds'].map(code => ({
        code,
        errors: [
            {
                type: 'Identifier',
            },
        ],
    })),
});
