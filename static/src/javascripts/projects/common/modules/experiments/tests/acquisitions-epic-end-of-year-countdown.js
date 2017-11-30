// @flow
import { makeABTest } from 'common/modules/commercial/contributions-utilities';
import {
    endOfYearCountdown,
    asWeHeadInto2018,
} from 'common/modules/commercial/acquisitions-copy';

const daysLeftUntilEndOfYear = (): string => {
    const now = Date.now();
    const endOfYear = new Date(2018, 0, 1).getTime();
    const daysLeft = Math.ceil((endOfYear - now) / 1000 / 60 / 60 / 24);
    return daysLeft > 1
        ? `There are ${daysLeft} days`
        : `There’s ${daysLeft} day`;
};

export const acquisitionsEpicEndOfYearCountdown = makeABTest({
    id: 'AcquisitionsEpicEndOfYearCountdown',
    campaignId: 'epic_end_of_year_countdown',

    start: '2017-11-30',
    expiry: '2018-01-10',

    author: 'Joseph Smith',
    description:
        'This will guarantee that the epic is always displayed on election stories',
    successMeasure: 'Conversion rate',
    idealOutcome: 'We can always show the epic on election articles',
    audienceCriteria: 'All',
    audience: 1,
    locations: ['US'],
    audienceOffset: 0,

    variants: [
        {
            id: 'control',
            products: [],
        },
        {
            id: 'end_of_year_countdown',
            products: [],
            options: {
                copy: endOfYearCountdown(daysLeftUntilEndOfYear()),
            },
        },
        {
            id: 'as_we_head_into_2018',
            products: [],
            options: {
                copy: asWeHeadInto2018,
            },
        },
    ],
});
