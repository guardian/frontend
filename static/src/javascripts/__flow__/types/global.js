declare var __webpack_public_path__:string;

declare var twttr: {
    widgets?: {
        load?: (?Element) => void
    }
};

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
