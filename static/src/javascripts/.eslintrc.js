module.exports = {
    baseConfig: false,
    env: {
        amd: true,
        jasmine: true,
        es6: false,
        commonjs: false
    },
    extends: 'eslint:recommended',
	parserOptions: {
		ecmaVersion: 5
	},
    rules: {
        camelcase: 'off',
        'no-shadow': 'off',
        strict: 'off',
        'no-alert': 'off',
        'no-all-lodash-import': 'error',
        'no-undef': 'error',
        'no-use-before-define': [
            'error',
            'nofunc'
        ],
        'no-multi-spaces': 'off',
        'no-underscore-dangle': 'off',
        'key-spacing': 'off',
        'import/no-amd': 'off',
        'import/no-dynamic-require': 'off'
    }
}
