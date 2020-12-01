

import promised from "./fastdom-promise";

/* eslint-disable no-unused-vars */
export default {
  measure: (fn: Function, ctx: Object | null | undefined): number => fn(),
  mutate: (fn: Function, ctx: Object | null | undefined): number => fn(),
  clear: (id: number): void => {},
  extend: () => promised
};