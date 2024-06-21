export default {
	description: 'Compile JS',
	task: [
		(await import('./clean.mjs')).default,
		(await import('../inline-svgs/index.mjs')).default,
		(await import('./webpack-atoms')).default,
	],
};
