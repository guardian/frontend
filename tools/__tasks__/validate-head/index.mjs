export default {
	description: 'Validate commits',
	task: [
		// get prettier to keep this over multiple lines
		(await import('./javascript.mjs')).default,
		(await import('./sass.mjs')).default,
	],
	concurrent: true,
};
