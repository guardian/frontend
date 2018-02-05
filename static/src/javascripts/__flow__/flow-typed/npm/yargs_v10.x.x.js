// flow-typed signature: d6f0db2a3d04a409b27a3514e5f1ab23
// flow-typed version: da30fe6876/yargs_v10.x.x/flow_>=v0.54.x

declare module "yargs" {
  declare type Argv = {
    _: Array<string>,
    $0: string,
    [key: string]: mixed
  };

  declare type Options = $Shape<{
    alias: string | Array<string>,
    array: boolean,
    boolean: boolean,
    choices: Array<mixed>,
    coerce: (arg: mixed) => mixed,
    config: boolean,
    configParser: (configPath: string) => { [key: string]: mixed },
    conflicts: string | { [key: string]: string },
    count: boolean,
    default: mixed,
    defaultDescription: string,
    demandOption: boolean | string,
    desc: string,
    describe: string,
    description: string,
    global: boolean,
    group: string,
    implies: string | { [key: string]: string },
    nargs: number,
    normalize: boolean,
    number: boolean,
    requiresArg: boolean,
    skipValidation: boolean,
    string: boolean,
    type: "array" | "boolean" | "count" | "number" | "string"
  }>;

  declare type CommonModuleObject = {|
    command?: string | Array<string>,
    aliases?: Array<string> | string,
    builder?: { [key: string]: Options } | ((yargsInstance: Yargs) => mixed),
    handler?: (argv: Argv) => void
  |};

  declare type ModuleObjectDesc = {|
    ...CommonModuleObject,
    desc?: string | false
  |};

  declare type ModuleObjectDescribe = {|
    ...CommonModuleObject,
    describe?: string | false
  |};

  declare type ModuleObjectDescription = {|
    ...CommonModuleObject,
    description?: string | false
  |};

  declare type ModuleObject =
    | ModuleObjectDesc
    | ModuleObjectDescribe
    | ModuleObjectDescription;

  declare class Yargs {
    (args: Array<string>): Yargs;

    alias(key: string, alias: string): this;
    alias(alias: { [key: string]: string | Array<string> }): this;
    argv: Argv;
    array(key: string | Array<string>): this;
    boolean(paramter: string | Array<string>): this;
    check(fn: (argv: Argv, options: Array<string>) => ?boolean): this;
    choices(key: string, allowed: Array<string>): this;
    choices(allowed: { [key: string]: Array<string> }): this;
    coerce(key: string, fn: (value: any) => mixed): this;
    coerce(object: { [key: string]: (value: any) => mixed }): this;
    coerce(keys: Array<string>, fn: (value: any) => mixed): this;

    command(
      cmd: string | Array<string>,
      desc: string | false,
      builder?: { [key: string]: Options } | ((yargsInstance: Yargs) => mixed),
      handler?: Function
    ): this;

    command(
      cmd: string | Array<string>,
      desc: string | false,
      module: ModuleObject
    ): this;

    command(module: ModuleObject): this;

    completion(
      cmd: string,
      description?: string,
      fn?: (
        current: string,
        argv: Argv,
        done: (competion: Array<string>) => void
      ) => ?(Array<string> | Promise<Array<string>>)
    ): this;

    config(
      key?: string,
      description?: string,
      parseFn?: (configPath: string) => { [key: string]: mixed }
    ): this;
    config(
      key: string,
      parseFn?: (configPath: string) => { [key: string]: mixed }
    ): this;
    config(config: { [key: string]: mixed }): this;

    conflicts(key: string, value: string | Array<string>): this;
    conflicts(keys: { [key: string]: string | Array<string> }): this;

    count(name: string): this;

    default(key: string, value: mixed, description?: string): this;
    default(defaults: { [key: string]: mixed }): this;

    // Deprecated: use demandOption() and demandCommand() instead.
    demand(key: string, msg?: string | boolean): this;
    demand(count: number, max?: number, msg?: string | boolean): this;

    demandOption(key: string | Array<string>, msg?: string | boolean): this;

    demandCommand(min: number, minMsg?: string): this;
    demandCommand(
      min: number,
      max: number,
      minMsg?: string,
      maxMsg?: string
    ): this;

    describe(key: string, description: string): this;
    describe(describeObject: { [key: string]: string }): this;

    detectLocale(shouldDetect: boolean): this;

    env(prefix?: string): this;

    epilog(text: string): this;
    epilogue(text: string): this;

    example(cmd: string, desc: string): this;

    exitProcess(enable: boolean): this;

    fail(fn: (failureMessage: string, err: Error, yargs: Yargs) => mixed): this;

    getCompletion(args: Array<string>, fn: () => void): this;

    global(globals: string | Array<string>, isGlobal?: boolean): this;

    group(key: string | Array<string>, groupName: string): this;

    help(option?: string, desc?: string): this;

    implies(key: string, value: string | Array<string>): this;
    implies(keys: { [key: string]: string | Array<string> }): this;

    locale(
      locale: | "de"
      | "en"
      | "es"
      | "fr"
      | "hi"
      | "hu"
      | "id"
      | "it"
      | "ja"
      | "ko"
      | "nb"
      | "pirate"
      | "pl"
      | "pt"
      | "pt_BR"
      | "ru"
      | "th"
      | "tr"
      | "zh_CN"
    ): this;
    locale(): string;

    nargs(key: string, count: number): this;

    normalize(key: string): this;

    number(key: string | Array<string>): this;

    option(key: string, options?: Options): this;
    option(optionMap: { [key: string]: Options }): this;

    options(key: string, options?: Options): this;
    options(optionMap: { [key: string]: Options }): this;

    parse(
      args?: string | Array<string>,
      context?: { [key: string]: mixed },
      parseCallback?: (err: Error, argv: Argv, output?: string) => void
    ): Argv;
    parse(
      args?: string | Array<string>,
      parseCallback?: (err: Error, argv: Argv, output?: string) => void
    ): Argv;

    pkgConf(key: string, cwd?: string): this;

    recommendCommands(): this;

    // Alias of demand()
    require(key: string, msg: string | boolean): this;
    require(count: number, max?: number, msg?: string | boolean): this;

    requiresArg(key: string | Array<string>): this;

    reset(): this;

    showCompletionScript(): this;

    showHelp(consoleLevel?: "error" | "warn" | "log"): this;

    showHelpOnFail(enable: boolean, message?: string): this;

    strict(): this;

    skipValidation(key: string): this;

    strict(global?: boolean): this;

    string(key: string | Array<string>): this;

    updateLocale(obj: { [key: string]: string }): this;
    updateStrings(obj: { [key: string]: string }): this;

    usage(message: string, opts?: { [key: string]: Options }): this;

    version(): this;
    version(version: string): this;
    version(option: string | (() => string), version: string): this;
    version(
      option: string | (() => string),
      description: string | (() => string),
      version: string
    ): this;

    wrap(columns: number | null): this;
  }

  declare module.exports: Yargs;
}
