// cribbed from https://github.com/k15a/eslint-plugin-import/commit/84fd4f27eb537c9230196d6403aafd406e46e6e9

const isExportStatement = (node, context) => {
    if (
        [
            'ExportAllDeclaration',
            'ExportNamedDeclaration',
            'ExportDefaultDeclaration',
        ].includes(node.type) &&
        // ignore flowtype exports
        !['type', 'interface'].includes(
            context.getSourceCode().getTokens(node)[1].value
        )
    ) {
        return true;
    }

    return false;
};

module.exports = {
    create(context) {
        return {
            Program({ body }) {
                const lastNonExportStatement = body.reduce(
                    (acc, node, index) =>
                        isExportStatement(node, context) ? acc : index,
                    0
                );

                body.forEach((node, index) => {
                    if (
                        isExportStatement(node, context) &&
                        index < lastNonExportStatement
                    ) {
                        context.report({
                            node,
                            message:
                                'Export statements should appear at the end of the file',
                        });
                    }
                });
            },
        };
    },
};
