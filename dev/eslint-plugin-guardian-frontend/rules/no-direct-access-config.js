module.exports = {
    create(context) {
        const isDot = token =>
            token && token.type === 'Punctuator' && token.value === '.';
        const isIdentifier = token => token && token.type === 'Identifier';

        return {
            Identifier: node => {
                if (node.name === 'config') {
                    const [dot, child] = context
                        .getSourceCode()
                        .getTokensAfter(node, 2);

                    if (
                        isDot(dot) &&
                        isIdentifier(child) &&
                        child.value !== 'get'
                    ) {
                        context.report({
                            node,
                            message:
                                'Prefer accessing properties on config using get() method',
                        });
                    }
                }
            },
        };
    },
};
