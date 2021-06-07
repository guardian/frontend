module.exports = {
	extends: ['prettier'],
	plugins: ['guardian-frontend', 'prettier'],
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 6,
	},
	rules: {
		// disallow naming variables 'guardian', because
		// window.guardian is our global config/settings object
		'id-denylist': ['error', 'guardian'],
	},
	ignorePatterns: ['javascripts.flow.archive'],
	overrides: [
		{
			files: ['*.ts', '*.tsx'],
			extends: '@guardian/eslint-config-typescript',
			rules: {
				'import/no-unresolved': 0,
				'no-restricted-imports': [
					'error',
					{
						name: 'bonzo',
						message: 'Use `lib/$$` instead.',
					},
					{
						name: 'qwery',
						message: 'Use `lib/$$` instead.',
					},
					{
						name: 'bean',
						message: 'Use `lib/$$` instead.',
					},
				],
			},
		},
        {
            files: ['*.spec.ts'],
            rules: {
              // This rule erroneously flags up instances where you expect(obj.fn).toHaveBeenCalled
              // Enabled for test files only
              '@typescript-eslint/unbound-method': 'off',
            },
          },
	],
};
