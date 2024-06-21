export default {
	description: 'Compile assets for development',
	task: [
		import('./conf/clean.mjs'),
		import('./css/index.dev.mjs'),
		import('./data/index.watch.mjs'),
		import('./javascript/index.watch.mjs'),
		import('./conf/index.mjs'),
	],
};
