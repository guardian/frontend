import webpack from 'webpack';

/** @param {import('rxjs').Observer} observer */
export const reporter = (observer) =>
	new webpack.ProgressPlugin((progress, msg, ...details) => {
		const [a, b] = details;
		const state = a && b ? `[${a}, ${b}]` : '';

		observer.next(`${Math.round(progress * 100)}% ${msg} ${state}`);
	});
