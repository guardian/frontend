export default {
	description: 'Compile assets for template rendering in Play',
	task: [
		(await import('./copy.mjs')).default,
		(await import('../inline-svgs/index.mjs')).default,
	],
};
