export default {
	description: 'Prepare JS for development',
	task: [
		await import('../inline-svgs/index.mjs'),
		await import('./clean.mjs'),
		await import('./copy.mjs'),
		await import('./bundle-polyfills.mjs'),
	],
};
