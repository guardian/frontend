/* eslint-disable no-unused-vars */
export default {
	measure: (fn, ctx) => Promise.resolve(fn()),
	mutate: (fn, ctx) => Promise.resolve(fn()),
	clear: (id) => {},
};
