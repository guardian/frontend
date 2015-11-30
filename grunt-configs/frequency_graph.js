module.exports = function () {
    return {
        options: {
            basePath: '.',
            staticFolder: 'static/src/javascripts',
            seeds: [
                'bootstraps/standard.js',
                'bootstraps/enhanced.js',
                'bootstraps/commercial.js',
                'enhanced-vendor.js'
            ],
            requireConfig: '/grunt-configs/requirejs.js',
            gruntJit: true,
            destination: 'tmp/frequency_graph.html',
            credentials: null,
            envPrefix: 'AWS',
            profile: 'nextgen',
            bucket: 'aws-frontend-metrics',
            bucketKey: 'frequency/index.html',
            fullPage: false,
            costDays: 15
        },
        files: {}
    };
};
