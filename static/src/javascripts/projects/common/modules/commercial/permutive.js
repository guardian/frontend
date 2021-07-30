import { storage } from '@guardian/libs';

/*
 * Inside the bundle:
 * [None]
 *
 * Where is this file used outside the commercial bundle?
 * - static/src/javascripts/projects/common/modules/atoms/youtube-player.ts
 *
 * - static/src/javascripts/projects/common/modules/commercial/build-page-targeting.js
 * - static/src/javascripts/projects/common/modules/commercial/permutive.spec.js
 *
 */



const PERMUTIVE_KEY = `_papns`;
const PERMUTIVE_PFP_KEY = `_pdfps`;

const getSegments = (key) => {
    try {
        return JSON.parse(storage.local.getRaw(key) || '[]')
            .slice(0, 250)
            .map(s => Number.parseInt(s, 10))
            .filter(n => typeof n === 'number' && !Number.isNaN(n))
            .map(String);
    } catch (e) {
        return [];
    }
};

export const getPermutiveSegments = () => getSegments(PERMUTIVE_KEY);
export const getPermutivePFPSegments = () => getSegments(PERMUTIVE_PFP_KEY);

export const clearPermutiveSegments = () => {
    storage.local.remove(PERMUTIVE_KEY);
    storage.local.remove(PERMUTIVE_PFP_KEY);
};

export const _ = {
    PERMUTIVE_KEY,
    PERMUTIVE_PFP_KEY,
    getSegments,
};
