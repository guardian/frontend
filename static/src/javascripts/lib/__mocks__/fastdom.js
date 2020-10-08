// @flow

import promised from './fastdom-promise'

/* eslint-disable no-unused-vars */
export default {
    measure: (fn: Function, ctx: ?Object): number => fn(),
    mutate: (fn: Function, ctx: ?Object): number => fn(),
    clear: (id: number): void => {},
    extend: () => promised
};
