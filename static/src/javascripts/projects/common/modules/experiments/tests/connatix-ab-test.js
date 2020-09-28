// @flow strict
import { isInUsa } from "common/modules/commercial/geo-utils";

export const connatixTest: ABTest = {
    id: 'CommercialConnatix',
    start: '2020-12-03',
    expiry: '2020-10-04',
    author: 'Ioanna Kyprianou',
    description: 'This is to test connatix integration via GAM',
    audience: 0.02,
    audienceOffset: 0.0,
    successMeasure: 'We can test connatix integration via GAM',
    audienceCriteria: 'n/a',
    dataLinkNames: 'n/a',
    idealOutcome: 'Connatix integration works smoothly behind AB test',
    showForSensitive: false,
    canRun: () => isInUsa(),
    variants: [
        {
            id: 'control',
            test: (): void => {},
        },
        {
            id: 'variant',
            test: (): void => {},
        },
    ],
};
