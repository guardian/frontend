module.exports = {
    rules: {
        'global-config': {
            create: function(context) {
                return {
                    Identifier: (node) => {
                        if (
                            node.name === 'config' &&
                            (node.parent.type === 'MemberExpression' && 
                                // window.guardian.config
                                (node.parent.object.type === 'MemberExpression' &&
                                    node.parent.object.property.name === 'guardian' && 
                                        node.parent.object.object.name === 'window') ||
                                // guardian.config
                                (node.parent.type === 'MemberExpression' &&
                                   node.parent.object.type === 'Identifier' &&
                                    node.parent.object.name === 'guardian'))

                            ) {
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