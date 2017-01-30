const rule = require('eslint-plugin-frontend').rules['global-config'];
const { RuleTester } = require('eslint');
const ruleTester = new RuleTester({ parserOptions: { ecmaVersion: 2015 } });

console.log(ruleTester);

ruleTester.run('squiggly', rule, {

    valid: [
        // 'config.page',
        // 'config',
        // 'var config = 2',
        // 'foo.config',
        // 'foo.config.bar',
         'foo.guardian.config'
    ],

    invalid: [
        /*{
            code: 'var hello = guardian.config',
            errors: [{
                message: 'use da config module foo',
                type: 'Identifier'
            }]
        },
        {
            code: 'var hello = window.guardian.config',
            errors: [{
                message: 'use da config module foo',
                type: 'Identifier'
            }]
        },
        {
            code: 'var hello = loadscript(guardian.config)',
            errors: [{
                message: 'use da config module foo',
                type: 'Identifier'
            }]
        }*/
    ]
});
