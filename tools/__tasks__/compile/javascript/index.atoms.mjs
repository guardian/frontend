export default {
	description: 'Compile JS',
	task: [
		await import('./clean.mjs').then((module) => module.default),
		await import('../inline-svgs/index.mjs').then(
			(module) => module.default,
		),
		await import('./webpack-atoms').then((module) => module.default),
	],
};
