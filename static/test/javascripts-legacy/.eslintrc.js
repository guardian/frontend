module.exports = {
    env: {
        amd: true,
        jasmine: true,
        es6: false,
        commonjs: false,
        node: true,
        browser: true,
    },
    extends: "eslint:recommended",
    parserOptions: {
        ecmaVersion: 5,
    },
    rules: {
        camelcase: "off",
        "no-shadow": "off",
        "no-undef": "error",
        "no-use-before-define": ["error", "nofunc"],
        "no-multi-spaces": "off",
        "no-underscore-dangle": "off",
        "key-spacing": "off",
        "import/no-amd": "off",
        "import/no-dynamic-require": "off",
    },
    globals: {
        sinon: true,
        Promise: true
    },
    root: true
};
