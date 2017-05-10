module.exports = {
    create(context) {
        return {
            Identifier: node => {
                if (node.name === 'classList') {
                    context.report({
                        node,
                        message: 'You are using a classlist',
                    });
                }
            },
        };
    },
};
