// @flow

import config from 'lib/config';
import { services } from 'common/modules/services';

type AtomType = 'profile' | 'guide' | 'qanda' | 'timeline';

type Failure = string;

type Success<A> = A;

type Try<A> = Failure | Success<A>;

type Coeval<A> = {
    runTry: () => Try<A>,
};

type Atom = {
    atomId: string,
    start: () => Promise<void>,
    stop: () => void,
};

type AtomBuilder = Element => Coeval<Atom>;

declare type DomService = {
    read: Thunk => void,
    write: Thunk => void,
};

declare type ViewportService = {
    observe: (Element, number, Thunk) => void,
    unobserve: (Element, number, Thunk) => void,
};

declare type Services = {
    ophan: OphanService,
    dom: DomService,
    viewport: ViewportService,
};

type AtomMaker = {
    [AtomType]: {
        default: Services => AtomBuilder,
    },
};

const bootstrapAtom = (atomMaker: AtomMaker, atomType: AtomType) => {
    const atomBuilder = atomMaker[atomType].default(services);
    Array.from(
        document.querySelectorAll(`[data-atom-type='${atomType}']`)
    ).forEach(atomDom => {
        const atom = atomBuilder(atomDom).runTry();
        if (typeof atom === 'string') {
            // eslint-disable-next-line no-console
            console.log(
                `Failed to initialise atom [${atomType}/${atomDom.getAttribute(
                    'data-atom-id'
                ) || ''}]: ${atom}`
            );
        } else {
            atom.start();
        }
    });
};

const initAtoms = () => {
    if (config.get('page.atomTypes.guide')) {
        require.ensure(
            [],
            require => {
                const atomMaker = require('@guardian/atom-renderer/dist/guide/article/index');
                bootstrapAtom(atomMaker, 'guide');
            },
            'guide-atom'
        );
    }

    if (config.get('page.atomTypes.profile')) {
        require.ensure(
            [],
            require => {
                const atomMaker = require('@guardian/atom-renderer/dist/profile/article/index');
                bootstrapAtom(atomMaker, 'profile');
            },
            'profile-atom'
        );
    }

    if (config.get('page.atomTypes.qanda')) {
        require.ensure(
            [],
            require => {
                const atomMaker = require('@guardian/atom-renderer/dist/qanda/article/index');
                bootstrapAtom(atomMaker, 'qanda');
            },
            'qanda-atom'
        );
    }

    if (config.get('page.atomTypes.timeline')) {
        require.ensure(
            [],
            require => {
                const atomMaker = require('@guardian/atom-renderer/dist/timeline/article/index');
                bootstrapAtom(atomMaker, 'timeline');
            },
            'timeline-atom'
        );
    }
};

export { initAtoms };
