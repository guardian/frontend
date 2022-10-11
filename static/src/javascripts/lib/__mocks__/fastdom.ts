/* eslint-disable @typescript-eslint/no-unused-vars -- It's a mock */
import promised from './fastdom-promise';

// eslint-disable-next-line import/no-default-export -- Permit this
export default {
	measure: <T>(fn: () => T, ctx: unknown): T => fn(),
	mutate: <T>(fn: () => T, ctx: unknown): T => fn(),
	clear: (id: unknown): void => {
		// Do nothing...
	},
	extend: (): typeof promised => promised,
};
