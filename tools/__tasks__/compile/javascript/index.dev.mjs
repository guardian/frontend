export default {
	description: 'Prepare JS for development',
	task: [
		await import('../inline-svgs/index.mjs').then(
			(module) => module.default,
		),
		await import('./clean.mjs').then((module) => module.default),
		await import('./copy.mjs').then((module) => module.default),
		await import('../../commercial/compile').then(
			(module) => module.default,
		),
		await import('./webpack.dev').then((module) => module.default),
		await import('./webpack-dcr.dev').then((module) => module.default),
		await import('./bundle-polyfills.mjs').then((module) => module.default),
	],
};
