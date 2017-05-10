const { RuleTester } = require('eslint');
const rule = require('../rules/exports-last');

const ruleTester = new RuleTester({
    parser: 'babel-eslint',
    parserOptions: { ecmaVersion: 2015, sourceType: 'module' },
});

ruleTester.run('exports-last', rule, {
    valid: [
        `const foo = 'bar'; const bar = 'baz';`,
        `const foo = 'bar'; export {foo};`,
        `const foo = 'bar'; export default foo;`,
        `const foo = 'bar'; export default foo; export const bar = true;`,
        `export type a = { a: string }; const foo = 'bar';`,
    ],

    invalid: [
        `export default 'bar'; const bar = true;`,
        `export const foo = 'bar'; const bar = true;`,
    ].map(code => ({
        code,
        errors: ['Export statements should appear at the end of the file'],
    })),
});
