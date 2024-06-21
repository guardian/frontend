export default {
	description: 'Compile CSS',
	task: [
		await import('./clean.mjs').then((module) => module.default),
		await import('./mkdir.mjs').then((module) => module.default),
		await import('../images/index.mjs').then((module) => module.default),
		await import('./sass.mjs').then((module) => module.default),
	],
};
