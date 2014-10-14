module.exports = function(grunt, options) {
    return {
        cssSourceMaps: {
            src: [options.staticTargetDir + 'stylesheets/*.css.map'],
            overwrite: true,
            replacements: [{
                from: '../../../static/src/stylesheets/',
                to: ''
            }]
        }
    };
};
