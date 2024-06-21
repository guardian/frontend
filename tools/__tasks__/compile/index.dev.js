export default {
	description: 'Compile assets for development',
	task: [
		await import('./conf/clean.mjs'),
		await import('./css/index.dev.mjs'),
		await import('./data/index.dev'),
		await import('./javascript/index.dev'),
		await import('./conf/index.mjs'),
	],
};
