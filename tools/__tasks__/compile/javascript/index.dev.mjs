export default {
	description: 'Prepare JS for development',
	task: [
		(await import('../inline-svgs/index.mjs')).default,
		(await import('./clean.mjs')).default,
		(await import('./copy.mjs')).default,
		(await import('../../commercial/compile')).default,
		(await import('./webpack.dev')).default,
		(await import('./webpack-dcr.dev')).default,
		(await import('./bundle-polyfills.mjs')).default,
	],
};
