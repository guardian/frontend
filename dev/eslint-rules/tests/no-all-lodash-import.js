'use strict';

var rule = require('../no-all-lodash-import');
var RuleTester = require('eslint/lib/testers/rule-tester');

var ruleTester = new RuleTester();
ruleTester.run('no-all-lodash-import', rule, {
    valid: [
        'define([\'lodash/foo/bar\'])'
    ],
    invalid: [
        {
            code: 'define([\'lodash\'])',
            errors: [{ message: 'Use Lodash modules instead', type: 'Literal'}]
        }
    ]
});
