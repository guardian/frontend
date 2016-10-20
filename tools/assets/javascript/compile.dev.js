module.exports = [{
    title: 'Prepare JS for development',
    task: [
        require('../inline-svgs/compile'),
        require('./clean'),
        require('./copy')
    ]
}];
