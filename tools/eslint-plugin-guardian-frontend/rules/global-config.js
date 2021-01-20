module.exports = {
    create(context) {
        const isDot = token =>
            token && token.type === 'Punctuator' && token.value === '.';
        const isIdentifierOf = (prop, token) =>
            token && token.type === 'Identifier' && token.value === prop;

        return {
            Identifier: node => {
                if (node.name === 'config') {
                    const [dot1, parent, dot2, grandparent] = context
                        .getSourceCode()
                        .getTokensBefore(node, 4)
                        .reverse();

                    if (
                        isDot(dot1) &&
                        isIdentifierOf('guardian', parent) &&
                        (!isDot(dot2) || isIdentifierOf('window', grandparent))
                    ) {
                        context.report({
                            node,
                            message:
                                "use the 'config' module instead of window.guardian.config",
                        });
                    }
                }
            },
        };
    },
};
