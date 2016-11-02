module.exports = {
    description: 'Compile assets for template rendering in Play',
    task: [
        require('./clean'),
        require('./copy'),
        require('../inline-svgs'),
        require('./minify')
    ]
};
