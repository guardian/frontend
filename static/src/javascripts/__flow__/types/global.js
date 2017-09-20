declare var __webpack_public_path__:string;

declare var twttr: {
    widgets?: {
        load?: (?Element) => void
    }
};

// #? TODO: this type def conflates definitions for CommonJS require and Webpack's require
// When we replace Webpack's require with dynamic imports, we can remove this type def
// https://webpack.js.org/guides/code-splitting/#dynamic-imports
declare var require: {
    (id: string): any,
    ensure(
        ids: Array<string>,
        callback?: { (require: typeof require): void },
        chunk
        ? : string
    ): void,
    resolve: (id: string) => string,
    cache: any,
    main: typeof module,
};

declare type ThirdPartyTag = {
    shouldRun: boolean,
    url: string,
    onLoad?: () => any,
    useImage?: boolean,
};
