// @flow

import config from 'lib/config';
import { slots, _ } from './slot-config';
import { getBreakpointKey as getBreakpointKey_ } from './utils';

const { getSlots } = _;

const getBreakpointKey: any = getBreakpointKey_;

jest.mock('./utils', () => {
    // $FlowFixMe property requireActual is actually not missing Flow.
    const original = jest.requireActual('./utils');
    return {
        ...original,
        getBreakpointKey: jest.fn(),
    };
});

/* eslint-disable guardian-frontend/no-direct-access-config */
describe('getSlots', () => {
    beforeEach(() => {
        config.set('switches.extendedMostPopular', true);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should return the correct slots at breakpoint M', () => {
        getBreakpointKey.mockReturnValue('M');
        expect(getSlots('Article')).toEqual([
            {
                key: 'right',
                sizes: [[300, 600], [300, 250]],
            },
            {
                key: 'inline1',
                sizes: [[300, 250]],
            },
            {
                key: 'top-above-nav',
                sizes: [[300, 250]],
            },
            {
                key: 'inline',
                sizes: [[300, 250]],
            },
            {
                key: 'mostpop',
                sizes: [[300, 250]],
            },
        ]);
    });

    test('should return the correct slots at breakpoint T', () => {
        getBreakpointKey.mockReturnValue('T');
        expect(getSlots('Article')).toEqual([
            {
                key: 'right',
                sizes: [[300, 600], [300, 250]],
            },
            {
                key: 'inline1',
                sizes: [[300, 250]],
            },
            {
                key: 'top-above-nav',
                sizes: [[728, 90]],
            },
            {
                key: 'inline',
                sizes: [[300, 250]],
            },
            {
                key: 'mostpop',
                sizes: [[300, 250]],
            },
        ]);
    });

    test('should return the correct slots at breakpoint D on article pages', () => {
        getBreakpointKey.mockReturnValue('D');
        const desktopSlots = getSlots('Article');
        expect(desktopSlots).toContainEqual({
            key: 'inline',
            sizes: [[300, 600], [300, 250]],
        });
        expect(desktopSlots).not.toContainEqual({
            key: 'inline',
            sizes: [[300, 250]],
        });
    });

    test('should return the correct slots at breakpoint T on crossword pages', () => {
        getBreakpointKey.mockReturnValue('T');
        const tabletSlots = getSlots('Crossword');
        expect(tabletSlots).toContainEqual({
            key: 'inline1',
            sizes: [[728, 90]],
        });
    });

    test('should return the correct slots at breakpoint D on other pages', () => {
        getBreakpointKey.mockReturnValue('D');
        const desktopSlots = getSlots('');
        expect(desktopSlots).toContainEqual({
            key: 'inline',
            sizes: [[300, 250]],
        });
        expect(desktopSlots).not.toContainEqual({
            key: 'inline',
            sizes: [[300, 600], [300, 250]],
        });
    });
});

describe('slots', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('should return the correct top-above-nav slot at breakpoint D', () => {
        getBreakpointKey.mockReturnValue('D');
        expect(slots('top-above-nav', '')).toEqual([
            {
                key: 'top-above-nav',
                sizes: [[970, 250], [728, 90]],
            },
        ]);
    });

    test('should return the correct top-above-nav slot at breakpoint T', () => {
        getBreakpointKey.mockReturnValue('T');
        expect(slots('top-above-nav', '')).toEqual([
            {
                key: 'top-above-nav',
                sizes: [[728, 90]],
            },
        ]);
    });

    test('should return the correct top-above-nav slot at breakpoint M', () => {
        getBreakpointKey.mockReturnValue('M');
        expect(slots('top-above-nav', '')).toEqual([
            {
                key: 'top-above-nav',
                sizes: [[300, 250]],
            },
        ]);
    });
});
