// @flow
import { local } from 'lib/storage';

const PERMUTIVE_KEY = `_papns`;

export const getPermutiveSegments = (): Array<string> => {
    try {
        return JSON.parse(local.getRaw(PERMUTIVE_KEY) || '[]')
            .slice(0, 250)
            .filter(s => typeof s === 'number')
            .map(String);
    } catch (e) {
        return [];
    }
};
