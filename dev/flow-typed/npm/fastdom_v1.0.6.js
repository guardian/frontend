declare module 'fastdom' {
  declare module.exports: {
    measure(fn: Function, ctx: ?Object): number;
    mutate(fn: Function, ctx: ?Object): number;
    clear(id: number): void;
  };
}
