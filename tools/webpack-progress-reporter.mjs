import webpack from 'webpack';

/** @param {import('rxjs').Observer<string>} observer */
const reporter = (observer) =>
	new webpack.ProgressPlugin((progress, msg, ...details) => {
		const [a, b] = details;
		const state = a && b ? `[${a}, ${b}]` : '';
		return observer.next(`${Math.round(progress * 100)}% ${msg} ${state}`);
	});

export default reporter;
