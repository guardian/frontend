export default {
	description: 'Compile CSS',
	task: [
		(await import('./clean.mjs')).default,
		(await import('./mkdir.mjs')).default,
		(await import('../images/index.mjs')).default,
		(await import('./sass.mjs')).default,
	],
};
