const { RuleTester } = require('eslint');
const rule = require('../rules/no-default-export');

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
});

ruleTester.run('no-default-export', rule, {
    valid: [
        "export const hi = { hi: 'hi' }",
        'export const hi = "hi"',
        'export { hi }',
    ],

    invalid: [
        'export default "hi"',
        "export default { hi: 'hi' }",
        'export default () => {}',
    ].map(code => ({
        code,
        errors: [{ message: 'Prefer named exports over default export.' }],
    })),
});
