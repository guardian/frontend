// @flow
/* eslint-disable no-unused-vars */
export default {
    measure: (fn: Function, ctx: ?Object): Promise<any> => Promise.resolve(fn()),
    mutate: (fn: Function, ctx: ?Object): Promise<any> => Promise.resolve(fn()),
    clear: (id: number): void => {},
};
