export default {
	description: 'Validate commits',
	task: [
		// get prettier to keep this over multiple lines
		await import('./javascript.mjs'),
		await import('./sass.mjs'),
	],
	concurrent: true,
};
