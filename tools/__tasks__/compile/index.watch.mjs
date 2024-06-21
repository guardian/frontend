export default {
	description: 'Compile assets for development',
	task: [
		(await import('./conf/clean.mjs')).default,
		(await import('./css/index.dev.mjs')).default,
		(await import('./data/index.watch.mjs')).default,
		(await import('./javascript/index.watch.mjs')).default,
		(await import('./conf/index.mjs')).default,
	],
};
