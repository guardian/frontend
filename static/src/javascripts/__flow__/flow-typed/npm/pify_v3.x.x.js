// flow-typed signature: 4e2c2165eabcf00092e6d9d2222940ac
// flow-typed version: 2e22276b15/pify_v3.x.x/flow_>=v0.25.x

type $npm$pify$CPSFunction = (...args: any[]) => any;

type $npm$pify$Options = {
  multiArgs?: boolean,
  include?: Array<string | RegExp>,
  exclude?: Array<string | RegExp>,
  excludeMain?: boolean,
  errorFirst?: boolean,
  promiseModule?: () => any
};

type $npm$pify$PromisifiedFunction = (...args: any[]) => Promise<*>;

declare module "pify" {
  declare module.exports: (
    input: $npm$pify$CPSFunction | Object,
    options?: $npm$pify$Options
  ) => (...args: any[]) => Promise<*> | Object;
}
