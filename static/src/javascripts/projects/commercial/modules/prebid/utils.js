// @flow

import { getBreakpoint } from 'lib/detect';

const stripSuffix = (s: string, suffix: string): string => {
    const re = new RegExp(`${suffix}$`);
    return s.replace(re, '');
};

export const getBreakpointKey = (): string => {
    switch (getBreakpoint()) {
        case 'mobile':
        case 'mobileMedium':
        case 'mobileLandscape':
        case 'phablet':
            return 'M';
        case 'tablet':
            return 'T';
        case 'desktop':
        case 'leftCol':
        case 'wide':
            return 'D';
        default:
            return 'D';
    }
};

export const stripMobileSuffix = (s: string): string =>
    stripSuffix(s, '--mobile');

export const stripTrailingNumbersAbove1 = (s: string): string =>
    stripSuffix(s, '([2-9]|\\d{2,})');
