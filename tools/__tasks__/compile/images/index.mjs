export default {
	description: 'Compile images',
	task: [
		(await import('./clean.mjs')).default,
		(await import('./copy.mjs')).default,
		(await import('./icons.mjs')).default,
		(await import('./svg.mjs')).default,
	],
};
