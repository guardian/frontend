export default {
	description: 'Clean download and build data assets',
	task: [
		(await import('./clean.mjs')).default,
		(await import('./download.mjs')).default,
		(await import('./amp.mjs')).default,
	],
};
