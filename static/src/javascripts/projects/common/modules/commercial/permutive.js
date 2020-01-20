// @flow
import { local } from 'lib/storage';

const PERMUTIVE_KEY = `_papns`;
const PFP_KEY = `_pdfps`;
type SegmentsKey = typeof PERMUTIVE_KEY | typeof PFP_KEY;

const getSegments = (key: SegmentsKey): Array<string> => {
    try {
        return JSON.parse(local.getRaw(key) || '[]')
            .slice(0, 250)
            .map(s => Number.parseInt(s, 10))
            .filter(n => typeof n === 'number' && !Number.isNaN(n))
            .map(String);
    } catch (e) {
        return [];
    }
};

export const getPermutiveSegments = () => getSegments(PERMUTIVE_KEY);
export const getPermutivePFPSegments = () => getSegments(PFP_KEY);

export const _ = {
    PERMUTIVE_KEY,
    PFP_KEY,
    getSegments,
};
