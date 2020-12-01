/* eslint-disable no-unused-vars */
export default {
    measure: (fn: Function, ctx: Object | null | undefined): Promise<any> =>
        Promise.resolve(fn()),
    mutate: (fn: Function, ctx: Object | null | undefined): Promise<any> =>
        Promise.resolve(fn()),
    clear: (id: number): void => {},
};
