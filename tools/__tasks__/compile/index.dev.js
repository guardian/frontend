export default {
	description: 'Compile assets for development',
	task: [
		import('./conf/clean.mjs'),
		import('./css/index.dev.mjs'),
		import('./data/index.dev'),
		import('./javascript/index.dev'),
		import('./conf/index.mjs'),
	],
};
