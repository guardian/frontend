'use strict'

var rule = require('../no-focused-tests');
var RuleTester = require('eslint/lib/testers/rule-tester');


var eslintTester = new RuleTester();

eslintTester.run('no-focused-tests', rule, {
    valid: [
        'describe("", function() {})',
        'describe("", function() { it("", function() {} ) })',
        'x = {a: ddescribe}'
    ],

    invalid: [
        {
            code: 'ddescribe("My exclusive suite", function() {});',
            errors: [
                {
                    message: 'Unexpected ddescribe.',
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'iit("My exclusive test", function() {});',
            errors: [
                {
                    message: 'Unexpected iit.',
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'fdescribe("My focused suite", function() {});',
            errors: [
                {
                    message: 'Unexpected fdescribe.',
                    type: 'CallExpression'
                }
            ]
        },
        {
            code: 'fit("My focused spec", function() {});',
            errors: [
                {
                    message: 'Unexpected fit.',
                    type: 'CallExpression'
                }
            ]
        }
    ]
})
