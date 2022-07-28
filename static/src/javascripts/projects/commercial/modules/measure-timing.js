export const measureTiming = (name) => {
	if (window.performance && window.performance.now) {
		const perf = window.performance;
		const startKey = `${name}-start`;
		const endKey = `${name}-end`;

		const start = () => {
			perf.mark(startKey);
		};

		const end = () => {
			perf.mark(endKey);
			perf.measure(name, startKey, endKey);

			const measureEntries = perf.getEntriesByName(name, 'measure');
			const timeTakenFloat = measureEntries[0].duration;
			const timeTakenInt = Math.round(timeTakenFloat);

			return timeTakenInt;
		};

		const clear = () => {
			perf.clearMarks(startKey);
			perf.clearMarks(endKey);
			perf.clearMeasures(name);
		};

		return {
			start,
			end,
			clear,
		};
	}
	return { start: () => null, end: () => null, clear: () => null };
};
