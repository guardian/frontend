module.exports = {
    description: 'Validate commits',
    task: [require('./javascript')],
    concurrent: true,
};
