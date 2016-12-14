module.exports = {
    description: 'Compile assets for template rendering in Play',
    task: [
        require('./copy'),
        require('../inline-svgs'),
    ],
};
