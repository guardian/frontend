const isIdentifier = node => node.type === 'Identifier';
const isArrayExpression = node => node.type === 'ArrayExpression';
const isDefine = node => isIdentifier(node) && node.name === 'define';

module.exports = context => ({
    CallExpression(node) {
        const callee = node.callee;
        const firstArg = node.arguments[0];
        const hasDepsArray = firstArg && isArrayExpression(firstArg);

        if (isDefine(callee) && hasDepsArray) {
            const depsArray = firstArg;

            const lodashImports = depsArray.elements.filter((literalNode) => {
                const moduleId = literalNode.value;
                    // Require format of "lodash/foo/bar"
                return moduleId.match(/^lodash($|\/)/) && moduleId.split('/').length !== 3;
            });

            lodashImports.forEach((literalNode) => {
                context.report({
                    node: literalNode,
                    message: 'Use Lodash modules instead',
                });
            });
        }
    },
});
