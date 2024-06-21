import webpack from 'webpack';

export const watcher = (observer) =>
	new webpack.ProgressPlugin((progress, msg, ...details) => {
		const [a, b] = details;
		const state = a && b ? `[${a}, ${b}]` : '';

		`${Math.round(progress * 100)}% ${msg} ${state}`;
	});
