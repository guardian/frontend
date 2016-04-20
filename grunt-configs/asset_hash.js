module.exports = function (grunt, options) {
    return {
        options: {
            assetMap: options.staticHashDir + 'assets/assets.map',
            srcBasePath: 'static/target/',
            destBasePath: 'static/hash/',
            hashLength: options.isDev ? 0 : 32
        },
        all: {
            options: {
                preserveSourceMaps: true
            },
            files: [
                {
                    src: [options.staticTargetDir + '**/*'],
                    dest: options.staticHashDir
                }
            ]
        }
    };
};
