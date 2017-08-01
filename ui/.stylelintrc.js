// @flow
module.exports = {
    extends: 'stylelint-config-standard',
    plugins: ['stylelint-order', 'stylelint-scss'],
    rules: {
        indentation: 4,
        'selector-type-case': null,
        'selector-type-no-unknown': null,

        // needed by styltron
        'selector-pseudo-element-colon-notation': 'single',

        'order/properties-alphabetical-order': true,

        'at-rule-no-unknown': null,
        'scss/at-rule-no-unknown': true,
    },
};
