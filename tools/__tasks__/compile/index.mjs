export default {
	description: 'Compile assets for production',
	task: [
		(await import('./conf/clean.mjs')).default,
		(await import('./css/index.mjs')).default,
		(await import('./data/index.mjs')).default,
		(await import('./javascript/index.mjs')).default,
		(await import('./hash/index.mjs')).default,
		(await import('./conf/index.mjs')).default,
	],
};
