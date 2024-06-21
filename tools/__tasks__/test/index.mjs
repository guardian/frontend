export default {
	description: 'Test assets',
	task: [
		// prettier
		(await import('../compile/data/index.mjs')).default,
		(await import('./javascript/index.mjs')).default,
	],
	concurrent: true,
};
