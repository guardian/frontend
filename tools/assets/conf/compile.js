const {target} = require('../config').paths;

module.exports = [{
    title: 'Compile assets for template rendering in Play',
    task: [
        require('./copy'),
        require('../inline-svgs/compile'),
        require('./minify')
    ]
}];
