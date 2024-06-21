export default {
	description: 'Prepare JS for development',
	task: [
		(await import('../inline-svgs/index.mjs')).default,
		(await import('./clean.mjs')).default,
		(await import('./copy.mjs')).default,
		(await import('./bundle-polyfills.mjs')).default,
	],
};
