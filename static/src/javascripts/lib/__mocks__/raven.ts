// eslint-disable-next-line import/no-default-export -- Allow this here
export default {
	wrap(fn: unknown): unknown {
		return fn;
	},
	captureException(): void {
		// Do nothing
	},
};
