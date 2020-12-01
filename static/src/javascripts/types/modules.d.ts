/* eslint-disable-next-line @typescript-eslint/no-explicit-any */

declare module 'bonzo';
declare type Bonzo = any;

declare module 'bean';
declare type Bean = any;

declare module 'qwery';
declare type Qwery = any;

declare module '*.svg' {
    const content: any;
    export default content;
}

declare module 'raw-loader!*' {
    const value: string;
    export default value;
}
