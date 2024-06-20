export default {
	description: 'Compile JS',
	task: [
		import('./clean.mjs'),
		import('../inline-svgs/index.mjs'),
		import('./copy.mjs'),
		import('./webpack.mjs'),
		import('./webpack-atoms.mjs'),
		import('./bundle-polyfills.mjs'),
	],
};
