module.exports = {
    rules: {
        'global-config': {
            create: function (context) {
                return {
                    Identifier: (node) => {
                        console.log('===========');
                        console.log(node.name);
                        console.log(node.parent);
                        if (
                            node.name === 'config' &&
                            node.parent.object &&
                            node.parent.object.name === 'guardian'
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
