

/* eslint-disable no-unused-vars */
export default {
  read: (fn: Function, ctx: Object | null | undefined): Promise<any> => Promise.resolve(fn()),
  write: (fn: Function, ctx: Object | null | undefined): Promise<any> => Promise.resolve(fn()),
  defer: (frame: number, fn: Function, ctx: Object | null | undefined): Promise<any> => Promise.resolve(fn()),
  clear: (id: number): void => {}
};