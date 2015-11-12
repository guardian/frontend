var isIdentifier = function (node) {
    return node.type === 'Identifier';
};
var isArrayExpression = function (node) {
    return node.type === 'ArrayExpression';
};
var isDefine = function (node) {
    return isIdentifier(node) && node.name === 'define';
};

module.exports = function (context) {
    return {
        'CallExpression': function (node) {
            var callee = node.callee;
            var firstArg = node.arguments[0];
            var hasDepsArray = firstArg && isArrayExpression(firstArg);

            if (isDefine(callee) && hasDepsArray) {
                var depsArray = firstArg;

                var lodashImports = depsArray.elements.filter(function (literalNode) {
                    var moduleId = literalNode.value;
                    // Require format of "lodash/foo/bar"
                    return moduleId.match(/^lodash($|\/)/) && moduleId.split('/').length !== 3;
                });

                lodashImports.forEach(function (literalNode) {
                    context.report({
                        node: literalNode,
                        message: 'Use Lodash modules instead'
                    });
                });
            }
        }
    };
};
