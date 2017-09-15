// @flow
module.exports = {
    extends: 'stylelint-config-standard',
    plugins: ['stylelint-order', 'stylelint-scss'],
    rules: {
        indentation: 4,
        'selector-type-case': null,
        'selector-type-no-unknown': null,

        'order/properties-alphabetical-order': true,

        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': true,

        // styletron-specific
        'selector-pseudo-element-colon-notation': 'single',
        'declaration-no-important': true,
        'selector-max-attribute': 0,
        'selector-max-class': 0,
        'selector-max-id': 0,
        'selector-max-type': 1,
        'selector-max-universal': 0,
        'selector-max-compound-selectors': 1,
        'selector-max-combinators': 0,
        'at-rule-blacklist': [
            'media',
            'supports',
            'keyframes',
            'import',
            'document',
            'page',
            'font-face',
            'viewport',
            'counter-style',
        ],
        'property-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'media-feature-name-no-vendor-prefix': true,
        'at-rule-no-vendor-prefix': true,
    },
};
