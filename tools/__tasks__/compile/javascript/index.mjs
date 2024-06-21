export default {
	description: 'Compile JS',
	task: [
		(await import('./clean.mjs')).default,
		(await import('../inline-svgs/index.mjs')).default,
		(await import('./copy.mjs')).default,
		(await import('./webpack.mjs')).default,
		(await import('./webpack-atoms.mjs')).default,
		(await import('./bundle-polyfills.mjs')).default,
	],
};
