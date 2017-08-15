// @flow
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';

const success = advertId => complete => trackAdRender(advertId).then(complete);

const successLeft = success('dfp-ad--glabs-left');
const successInline = success('dfp-ad--glabs-inline');

export const glabsTrafficDriverSlots: ABTest = {
    id: 'GlabsTrafficDriverSlots',
    start: '2017-08-14',
    expiry: '2017-08-23',
    author: 'Jon Norman',
    description:
        'Adds in one of two new ad slots to drive traffic to specific GLabs campaigns, served through DFP.',
    audience: 0.3,
    audienceOffset: 0.05,
    successMeasure:
        'Higher clickthrough rates to specific campaigns targeted to the new GLabs slots',
    audienceCriteria: 'Users who are browsing articles on web.',
    dataLinkNames: '',
    idealOutcome:
        'Determine which variant produces the highest clickthrough rates with minimum disruption to attention time.',
    canRun: () => true,
    variants: [
        {
            id: 'inline',
            test: () => {},
            success: successInline,
        },
        {
            id: 'left',
            test: () => {},
            success: successLeft,
        },
        {
            id: 'control',
            test: () => {},
        },
    ],
};
