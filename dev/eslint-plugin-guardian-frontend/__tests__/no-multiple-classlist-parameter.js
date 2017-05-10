const { RuleTester } = require('eslint');
const rule = require('../rules/no-multiple-classlist-parameters');

const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

ruleTester.run('no-multiple-classlist-parameter', rule, {
    valid: ['element.classList.add("class1")'],

    invalid: ['element.classList.add("class1", "class2")'].map(code => ({
        code,
        errors: [
            {
                type: 'Identifier',
            },
        ],
    })),
});
