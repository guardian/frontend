module.exports = {
    dir: {
        src:    './static/src/',
        target: './static/target/',
        hash:   './static/hash/',
        testConf:     './static/test/javascripts/conf/',
        webfonts:     './static/src/stylesheets/components/guss-webfonts/webfonts/'
    },
    presets: {
        sass: {
            outputStyle: 'compressed',
            precision: 5
        },
        pxtorem: {
            replace: true,
            root_value: 16,
            unit_precision: 5
        }
    }
}
