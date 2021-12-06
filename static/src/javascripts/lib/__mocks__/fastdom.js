import promised from './fastdom-promise';

/* eslint-disable no-unused-vars */
export default {
	measure: (fn, ctx) => fn(),
	mutate: (fn, ctx) => fn(),
	clear: (id) => {},
	extend: () => promised,
};
