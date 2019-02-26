// @flow

import config from 'lib/config';
import { services } from 'projects/atoms/services';

const bootstrapAtom = <A>(atomMaker: AtomMaker<A>, atomType: AtomType) => {
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
        } else if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                atom.start();
            });
        } else {
            atom.start();
        }
    });
};

const initCharts = () => {
    const iframes: HTMLIFrameElement[] = ([
        ...document.querySelectorAll('.atom--chart > .atom__iframe'),
    ]: any);

    window.addEventListener('message', event => {
        const iframe: ?HTMLIFrameElement = iframes.find(i => {
            try {
                return i.name === event.source.name;
            } catch (e) {
                return false;
            }
        });
        if (iframe) {
            try {
                const message = JSON.parse(event.data);
                switch (message.type) {
                    case 'set-height':
                        iframe.height = message.value;
                        break;
                    default:
                }
                // eslint-disable-next-line no-empty
            } catch (e) {}
        }
    });

    iframes.forEach(iframe => {
        const src = (iframe.getAttribute('srcdoc') || '')
            .replace(/<gu-script>/g, '<script>')
            // eslint-disable-next-line no-useless-concat
            .replace(/<\/gu-script>/g, '<' + '/script>');
        iframe.setAttribute('srcdoc', src);
    });
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

    if (config.get('page.atomTypes.explainer')) {
        require.ensure(
            [],
            require => {
                require('@guardian/atom-renderer/dist/explainer/article/index.css');
                const atomMaker = require('@guardian/atom-renderer/dist/explainer/article/index');
                bootstrapAtom(atomMaker, 'explainer');
            },
            'explainer-atom'
        );
    }

    if (config.get('page.atomTypes.commonsdivision')) {
        require.ensure(
            [],
            require => {
                require('@guardian/atom-renderer/dist/commonsdivision/article/index.css');
                const atomMaker = require('@guardian/atom-renderer/dist/commonsdivision/article/index');
                bootstrapAtom(atomMaker, 'commonsdivision');
            },
            'commonsdivision-atom'
        );
    }

    if (config.get('page.atomTypes.audio')) {
        require.ensure(
            [],
            require => {
                require('@guardian/atom-renderer/dist/audio/article/index.css');
                const atomMaker = require('@guardian/atom-renderer/dist/audio/article/index');
                bootstrapAtom(atomMaker, 'audio');
            },
            'audio-atom'
        );
    }

    if (config.get('page.atomTypes.chart')) {
        initCharts();
    }
};
export { initAtoms };
