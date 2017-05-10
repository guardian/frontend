// cribbed from https://github.com/k15a/eslint-plugin-import/commit/84fd4f27eb537c9230196d6403aafd406e46e6e9

const isExportStatement = ({ type }) => {
    if (
        type === 'ExportDefaultDeclaration' ||
        type === 'ExportNamedDeclaration'
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
                        isExportStatement(node) ? acc : index,
                    0
                );

                body.forEach((node, index) => {
                    if (
                        isExportStatement(node) &&
                        index < lastNonExportStatement
                    ) {
                        context.report({
                            node,
                            message: 'Export statements should appear at the end of the file',
                        });
                    }
                });
            },
        };
    },
};
