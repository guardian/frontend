declare module 'fastdom' {
  declare module.exports: {
    read(fn: Function, ctx: ?Object): number;
    write(fn: Function, ctx: ?Object): number;
    defer(frame: number, fn: Function, ctx: ?Object): number;
    clear(id: number): void;
  };
}
