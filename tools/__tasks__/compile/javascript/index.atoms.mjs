export default {
	description: 'Compile JS',
	task: [
		import('./clean.mjs'),
		import('../inline-svgs/index.mjs'),
		import('./webpack-atoms.mjs'),
	],
};
