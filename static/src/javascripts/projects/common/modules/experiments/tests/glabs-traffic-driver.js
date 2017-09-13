// @flow
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';

const success = complete => trackAdRender('dfp-ad--glabs-left').then(complete);

export const glabsTrafficDriver: ABTest = {
    id: 'GlabsTrafficDriver',
    start: '2017-09-13',
    expiry: '2017-09-28',
    author: 'Jon Norman',
    description:
        'Adds in a new ad slot to drive traffic to specific GLabs campaigns, served through DFP.',
    audience: 0.4,
    audienceOffset: 0.05,
    successMeasure:
        'Higher clickthrough rates to specific campaigns targeted to the new GLabs slots',
    audienceCriteria: 'Users who are browsing articles on web.',
    dataLinkNames: '',
    idealOutcome:
        'Determine how much context matters when serving these traffic drivers.',
    canRun: () => true,
    variants: [
        {
            id: 'contextual1',
            test: () => {},
            success,
        },
        {
            id: 'contextual2',
            test: () => {},
            success,
        },
        {
            id: 'non-contextual',
            test: () => {},
            success,
        },
    ],
};
