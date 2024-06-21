export default {
	description: 'Compile assets for development',
	task: [
		await import('./conf/clean.mjs'),
		await import('./css/index.dev.mjs'),
		await import('./data/index.watch.mjs'),
		await import('./javascript/index.watch.mjs'),
		await import('./conf/index.mjs'),
	],
};
