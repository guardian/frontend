// @flow

import config from 'lib/config';
import { services } from 'common/modules/services';

const bootstrapAtom = (atomMaker, atomType) => {
    const atomBuilder = atomMaker.default(services);
    Array.from(
        document.querySelectorAll(`data-atom-type=['${atomType}']`)
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
                const guideAtom = require('@guardian/atom-renderer/build/guide/article/index');
                bootstrapAtom(guideAtom, 'guide');
            },
            'guide-atom'
        );
    }

    if (config.get('page.atomTypes.profile')) {
        require.ensure(
            [],
            require => {
                const guideAtom = require('@guardian/atom-renderer/build/profile/article/index');
                bootstrapAtom(guideAtom, 'profile');
            },
            'profile-atom'
        );
    }

    if (config.get('page.atomTypes.qanda')) {
        require.ensure(
            [],
            require => {
                const guideAtom = require('@guardian/atom-renderer/build/qanda/article/index');
                bootstrapAtom(guideAtom, 'qanda');
            },
            'qanda-atom'
        );
    }

    if (config.get('page.atomTypes.timeline')) {
        require.ensure(
            [],
            require => {
                const guideAtom = require('@guardian/atom-renderer/build/timeline/article/index');
                bootstrapAtom(guideAtom, 'timeline');
            },
            'timeline-atom'
        );
    }
};

export { initAtoms };
