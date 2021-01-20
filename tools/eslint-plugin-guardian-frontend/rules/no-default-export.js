const message = 'Prefer named exports over default export.';

module.exports = {
    create: context => ({
        ExportDefaultSpecifier(node) {
            context.report({
                node: node.exported,
                message,
            });
        },

        ExportDefaultDeclaration(node) {
            context.report({
                loc: node.loc,
                message,
            });
        },
    }),
};
