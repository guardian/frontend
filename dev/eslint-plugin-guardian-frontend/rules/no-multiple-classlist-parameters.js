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
                    const [
                        dot1,
                        parent,
                    ] = context
                        .getSourceCode()
                        .getTokensBefore(node, 2)
                        .reverse();

                    const [
                        ,
                        ,
                        nextToken,
                    ] = context.getSourceCode().getTokensAfter(node, 3);

                    if (
                        isDot(dot1) &&
                        isIdentifierOf('classList', parent) &&
                        isComma(nextToken)
                    ) {
                        context.report({
                            node,
                            message: 'You are using a classList.add',
                        });
                    }
                }
            },
        };
    },
};
