export default {
	description: 'Clean download and build data assets (dev)',
	task: [
		import('./clean.mjs'),
		import('./download.mjs'),
		import('./amp.mjs'),
	],
};
