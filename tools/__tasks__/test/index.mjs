export default {
	description: 'Test assets',
	task: [
		// prettier
		await import('../compile/data/index.mjs'),
		require('./javascript/index.mjs'),
	],
	concurrent: true,
};
