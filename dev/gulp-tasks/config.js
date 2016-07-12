const root = '..';

module.exports = {
    DIRECTORIES: {
        target: `${root}/static/target`
    },
    PRESETS: {
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
}
