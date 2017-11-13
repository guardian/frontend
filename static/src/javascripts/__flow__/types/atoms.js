// @flow

declare type Failure = string;

declare type Success<A> = A;

declare type Try<A> = Failure | Success<A>;

declare type Coeval<A> = {
    runTry: () => Try<A>,
};

declare type AtomType = 'profile' | 'guide' | 'qanda' | 'timeline';

declare type Atom = {
    atomId: string,
    start: () => Promise<void>,
    stop: () => void,
};

declare type AtomBuilder = (Element) => Coeval<Atom>;

declare type DomService = {
    read: (() => void) => void,
    write: (() => void) => void,
};

declare type ViewportService = {
    observe: (Element, number, () => void) => void,
    unobserve: (Element, number, () => void) => void,
};

declare type Services = {
    ophan: OphanService,
    dom: DomService,
    viewport: ViewportService,
};

// known issue: https://github.com/babel/babel-eslint#known-issues
// eslint-disable-next-line no-undef
declare type AtomMaker = {
    [AtomType]: {
        default: Services => AtomBuilder,
    },
};
