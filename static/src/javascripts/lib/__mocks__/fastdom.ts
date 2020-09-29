

/* eslint-disable no-unused-vars */
export default {
  read: (fn: Function, ctx: Object | null | undefined): number => fn(),
  write: (fn: Function, ctx: Object | null | undefined): number => fn(),
  defer: (frame: number, fn: Function, ctx: Object | null | undefined): number => fn(),
  clear: (id: number): void => {}
};