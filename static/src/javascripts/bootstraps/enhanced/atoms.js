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
                const guideAtom = require('@guardian/atom-renderer/build/guide');
                bootstrapAtom(guideAtom, 'guide');
            },
            'guide'
        );
    }

    if (config.get('page.atomTypes.profile')) {
        require.ensure(
            [],
            require => {
                const guideAtom = require('@guardian/atom-renderer/profile');
                bootstrapAtom(guideAtom, 'profile');
            },
            'profile'
        );
    }

    if (config.get('page.atomTypes.qanda')) {
        require.ensure(
            [],
            require => {
                const guideAtom = require('@guardian/atom-renderer/qanda');
                bootstrapAtom(guideAtom, 'qanda');
            },
            'qanda'
        );
    }

    if (config.get('page.atomTypes.timeline')) {
        require.ensure(
            [],
            require => {
                const guideAtom = require('@guardian/atom-renderer/timeline');
                bootstrapAtom(guideAtom, 'timeline');
            },
            'timeline'
        );
    }
};

export { initAtoms };
