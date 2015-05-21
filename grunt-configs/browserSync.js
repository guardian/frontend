module.exports = function (grunt, options) {
    return {
        dev: {
            bsFiles: {
                src: [
                    'static/hash/stylesheets/*.css',
                    'static/src/javascripts/**/*.js',
                    'static/src/javascripts/**/*.html',
                    '**/*.scala*'
                ]
            },
            options: {
                watchTask: true,
                proxy: "localhost:9000",
                open: false,
                minify: false,
                logPrefix: "FRONTEND"
            }
        }
    }
}
