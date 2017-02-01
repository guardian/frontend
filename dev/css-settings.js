module.exports = {
    sassSettings: {
        outputStyle: 'compressed',
        sourceMap: true,
        precision: 5,
    },
    browserslist: [
        'Firefox >= 26',
        'Explorer >= 10',
        'Safari >= 5',
        'Chrome >= 36',

        'iOS >= 5',
        'Android >= 2',
        'BlackBerry >= 6',
        'ExplorerMobile >= 7',

        '> 2% in US',
        '> 2% in AU',
        '> 2% in GB',
    ],
    remifications: {
        replace: true,
        root_value: 16,
        unit_precision: 5,
        prop_white_list: [],
    },
};
