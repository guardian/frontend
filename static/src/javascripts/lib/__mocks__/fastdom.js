// @flow
/* eslint-disable no-unused-vars */
export default {
    read: (fn: Function, ctx: ?Object): number => fn(),
    write: (fn: Function, ctx: ?Object): number => fn(),
    defer: (frame: number, fn: Function, ctx: ?Object): number => fn(),
    clear: (id: number): void => {},
};
