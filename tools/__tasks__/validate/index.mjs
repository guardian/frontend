export default {
	description: 'Lint assets',
	task: [
		(await import('./javascript.mjs')).default,
		(await import('./typescript.mjs')).default,
		(await import('./sass.mjs')).default,
		(await import('./check-for-disallowed-strings.mjs')).default,
	],
	concurrent: true,
};
