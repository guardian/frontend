'use strict'

/**
 * https://github.com/tlvince/eslint-plugin-jasmine/
 */

function prohibit (prohibiteds, context) {
    var regex = new RegExp('^(' + prohibiteds.join('|') + ')$');

    return {
        'CallExpression': function (node) {
            var result = node.callee && node.callee.name && node.callee.name.match(regex);

            if (result) {
                context.report(node, 'Unexpected {{name}}.', {
                    name: result[1]
                })
            }
        }
    }
}

module.exports = function (context) {
    var prohibiteds = [
        'fdescribe',
        'ddescribe',
        'fit',
        'iit'
    ];

    return prohibit(prohibiteds, context)
};
