/* eslint-disable import/no-extraneous-dependencies */

const RuleTester = require('eslint/lib/testers/rule-tester');
const rule = require('../no-all-lodash-import');

const ruleTester = new RuleTester();
ruleTester.run('no-all-lodash-import', rule, {
    valid: [
        'define([\'lodash/foo/bar\'])',
    ],
    invalid: [
        {
            code: 'define([\'lodash\'])',
            errors: [{ message: 'Use Lodash modules instead', type: 'Literal' }],
        },
    ],
});
