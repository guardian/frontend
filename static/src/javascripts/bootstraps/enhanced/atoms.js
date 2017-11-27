// @flow

import config from 'lib/config';
import { services } from 'projects/atoms/services';

const bootstrapAtom = <A>(atomMaker: AtomMaker<A>, atomType: AtomType) => {
    const atomBuilder = atomMaker[atomType].default(services);
    [...document.querySelectorAll(`[data-atom-type='${atomType}']`)].forEach(
        atomDom => {
            const atom = atomBuilder(atomDom).runTry();
            if (typeof atom === 'string') {
                // eslint-disable-next-line no-console
                console.log(
                    `Failed to initialise atom [${
                        atomType
                    }/${atomDom.getAttribute('data-atom-id') || ''}]: ${atom}`
                );
            } else if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    atom.start();
                });
            } else {
                atom.start();
            }
        }
    );
};

const initAtoms = () => {
    if (config.get('page.atomTypes.guide')) {
        require.ensure(
            [],
            require => {
                require('@guardian/atom-renderer/dist/guide/article/index.css');
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
                require('@guardian/atom-renderer/dist/profile/article/index.css');
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
                require('@guardian/atom-renderer/dist/qanda/article/index.css');
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
                require('@guardian/atom-renderer/dist/timeline/article/index.css');
                const atomMaker = require('@guardian/atom-renderer/dist/timeline/article/index');
                bootstrapAtom(atomMaker, 'timeline');
            },
            'timeline-atom'
        );
    }

    if (config.get('page.atomTypes.storyquestions')) {
        require.ensure(
            [],
            require => {
                require('@guardian/atom-renderer/dist/storyquestions/article/index.css');
                const atomMaker = require('@guardian/atom-renderer/dist/storyquestions/article/index');
                bootstrapAtom(atomMaker, 'storyquestions');
            },
            'storyquestions-atom'
        );
    }
};

export { initAtoms };
