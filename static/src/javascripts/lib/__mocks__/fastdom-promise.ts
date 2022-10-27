/* eslint-disable @typescript-eslint/no-unused-vars -- It's a mock */
// eslint-disable-next-line import/no-default-export -- Permit this
export default {
	measure: <T>(fn: () => T, ctx: unknown): Promise<T> =>
		Promise.resolve(fn()),
	mutate: <T>(fn: () => T, ctx: unknown): Promise<T> => Promise.resolve(fn()),
	clear: (id: unknown): void => {
		// Do nothing...
	},
};
