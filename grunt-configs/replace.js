module.exports = function (grunt, options) {
    return {
        cssSourceMaps: {
            src: [options.staticTargetDir + 'stylesheets/*.css.map'],
            overwrite: true,
            replacements: [{
                from: '../../src/stylesheets/',
                to: './'
            }]
        },
        jspmSourceMaps: {
            src: [options.staticTargetDir + 'bundles/*.js.map'],
            overwrite: true,
            replacements: [{
                from: '../../src/',
                to: '../'
            }]
        }
    };
};
