module.exports = {
    description: 'Validate commits',
    task: [
        require('./javascript'),
        require('../validate/check-for-disallowed-strings'),
    ],
    concurrent: true,
};
