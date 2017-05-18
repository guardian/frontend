// @flow
import type { ABTest, Variant } from '../ab-types';

export const genVariant = (id: string): Variant => ({
    id,
    test: () => undefined,
});

export const genAbTest = (id: string, canRun: ?boolean): ABTest => ({
    id,
    audienceCriteria: 'n/a',
    audienceOffset: 0,
    audience: 1,
    author: 'n/a',
    canRun: () => {
        if (canRun != null) return !!canRun;
        return true;
    },
    description: 'n/a',
    start: '0001-01-01',
    expiry: '9999-12-12',
    successMeasure: 'n/a',
    variants: [genVariant('control'), genVariant('variant')],
});
