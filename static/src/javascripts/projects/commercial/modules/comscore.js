// @flow strict
import config from 'lib/config';
import { loadScript } from 'lib/load-script';

type comscoreGlobals = { c1: string, c2: string, comscorekw?: string };

const comscoreSrc = '//sb.scorecardresearch.com/beacon.js';
const comscoreC1 = '2';
const comscoreC2 = '6035250';

const getGlobals = (keywords: string): comscoreGlobals => {
    const globals: comscoreGlobals = { c1: comscoreC1, c2: comscoreC2 };

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

        loadScript(comscoreSrc, { id: 'comscore', async: true });
    }

    return Promise.resolve();
};

export const _ = {
    getGlobals,
    comscoreSrc,
    comscoreC1,
    comscoreC2,
};
