// @flow strict
import config from 'lib/config';

type comscoreGlobals = { c1: string, c2: string, comscorekw?: string };

const getGlobals = (keywords: string): comscoreGlobals => {
    const globals: comscoreGlobals = { c1: '2', c2: '6035250' };

    if (keywords !== 'Network Front') {
        globals.comscorekw = keywords;
    }

    return globals;
};

export const init = (): Promise<void> => {
    if (config.get('switches.comscore', false)) {
        // eslint-disable-next-line no-underscore-dangle
        window._comscore = window._comscore || [];

        // eslint-disable-next-line no-underscore-dangle
        window._comscore.push(getGlobals(config.get('page.keywords', '')));

        const s = document.createElement('script');
        s.id = 'comscore';
        s.async = true;
        s.src = 'https://sb.scorecardresearch.com/beacon.js';

        const el = document.getElementsByTagName('script')[0];

        if (el && el.parentNode) {
            el.parentNode.insertBefore(s, el);
        }
    }

    return Promise.resolve();
};

export const _ = {
    getGlobals,
};
