// @flow
module.exports = {
    extends: 'stylelint-config-standard',
    plugins: ['stylelint-order'],
    rules: {
        indentation: 4,
        'selector-type-case': null,
        'selector-type-no-unknown': null,

        'order/properties-alphabetical-order': true,

        'at-rule-no-unknown': null,

        // styletron-specific
        'selector-pseudo-element-colon-notation': 'single',
        'declaration-no-important': true,
        'at-rule-blacklist': [
            'keyframes',
            'import',
            'document',
            'page',
            'counter-style',
        ],
        'property-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'at-rule-no-vendor-prefix': true,
    },
};
