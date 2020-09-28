module.exports = {
    create(context) {
        const isDot = token =>
            token && token.type === 'Punctuator' && token.value === '.';
        const isComma = token =>
            token && token.type === 'Punctuator' && token.value === ',';
        const isIdentifierOf = (prop, token) =>
            token && token.type === 'Identifier' && token.value === prop;

        return {
            Identifier: node => {
                if (node.name === 'add') {
                    const [dot, parent] = context
                        .getSourceCode()
                        .getTokensBefore(node, 2)
                        .reverse();
                    const [
                        ,
                        ,
                        maybeComma,
                    ] = context.getSourceCode().getTokensAfter(node, 3);

                    if (
                        isDot(dot) &&
                        isIdentifierOf('classList', parent) &&
                        isComma(maybeComma)
                    ) {
                        context.report({
                            node,
                            message: `Only one class name can be passed to classList.add
                                See: https://github.com/Financial-Times/polyfill-service/issues/268`,
                        });
                    }
                }
            },
        };
    },
};
