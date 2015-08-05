export const DIRECTORIES = {
    src:    './static/src',
    target: './static/target',
    hash:   './static/hash',
    public: './static/public',
    testConf:     './static/test/javascripts/conf',
    webfonts:     './static/src/stylesheets/components/guss-webfonts/webfonts'
};

export const PRESETS = {
    sass: {
        outputStyle: 'compressed',
        precision: 5
    },
    pxtorem: {
        replace: true,
        root_value: 16,
        unit_precision: 5,
        prop_white_list: []
    }
}
