import performanceAPI from './window-performance';

const timings: Record<string, number> = {};

const getCurrentTime = (): number => performanceAPI.now();

const markTime = (label: string): void => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we’re checking out-of-spec browsers
	if (performanceAPI && 'mark' in performanceAPI) {
		performanceAPI.mark(label);
	} else {
		timings[label] = getCurrentTime();
	}
};

// Returns the ms time when the mark was made.
const getMarkTime = (label: string): number | null => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we’re checking out-of-spec browsers
	if (performanceAPI && 'getEntriesByName' in performanceAPI) {
		const perfMark = performanceAPI.getEntriesByName(label, 'mark');

		if (perfMark[0] && 'startTime' in perfMark[0]) {
			return perfMark[0].startTime;
		}
	} else if (label in timings) {
		return timings[label];
	}

	return null;
};

export { markTime, getMarkTime, getCurrentTime };
