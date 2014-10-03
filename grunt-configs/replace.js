module.exports = function(grunt, options) {
    return {
        cssSourceMaps: {
            src: [options.staticTargetDir + 'stylesheets/*.css.map'],
            overwrite: true,
            replacements: [{
                from: '../../../common/app/assets/stylesheets/',
                to: ''
            }]
        }
    };
};
