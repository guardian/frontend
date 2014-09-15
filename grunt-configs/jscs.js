module.exports = function(grunt, options) {
    return {
        src: [
            'common/app/assets/javascripts/{bootstraps,modules,utils}/**/*.js'
        ],
        options: {
            config: 'resources/jscs_conf.json'
        }
    };
};
