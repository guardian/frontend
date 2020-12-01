declare type Bonzo = any;

declare module 'bonzo' {
    export default function (...elements: any[]): Array<Bonzo>;
};
