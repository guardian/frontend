export default {
	description: 'Lint assets',
	task: [
		await import('./javascript.mjs'),
		await import('./typescript.mjs'),
		await import('./sass.mjs'),
		await import('./check-for-disallowed-strings.mjs'),
	],
	concurrent: true,
};
