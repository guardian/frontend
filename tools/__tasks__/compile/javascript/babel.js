const {src} = require('../../config').paths;

module.exports = {
    description: 'Transpile to ES5',
    task: `babel ${src}/javascripts -d ${src}/../es5 --ignore bower_components,components,vendor`
};
