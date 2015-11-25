const root = '..';

export const DIRECTORIES = {
    src: `${root}/static/src`,
    target: `${root}/static/target`,
    hash: `${root}/static/hash`,
    public: `${root}/static/public`,
    testConf: `${root}/static/test/javascripts/conf`,
    webfonts: `${root}/static/src/stylesheets/components/guss-webfonts/webfonts`
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
