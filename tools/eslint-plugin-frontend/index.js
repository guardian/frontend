module.exports = {
    rules: {
        'global-config': {
            create: function(context) {
                return {
                    Identifier: (node) => {
                        if (
                            node.name === 'config' &&
                            // window.guardian.config
                            ((node.parent.type === 'MemberExpression' && 
                                node.parent.object.type === 'MemberExpression' &&
                                    node.parent.object.property.name === 'guardian' && 
                                        node.parent.object.object.name === 'window') || 
                                // guardian.config
                                (node.parent.type === 'MemberExpression' &&
                                   node.parent.object.type === 'Identifier' &&
                                    node.parent.object.name === 'guardian') ||
                            // config, foo.guardian.config, foo.config.bar
                            (node.parent.type === 'ExpressionStatement' && node.parent.expression.name === 'window'))) {
                            context.report({
                                node,
                                message: 'use da config module foo'
                            });
                        }
                    }
                };
            }
        }
    }
};