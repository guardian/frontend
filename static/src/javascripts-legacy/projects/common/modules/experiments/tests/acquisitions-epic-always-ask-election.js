define([
    'common/modules/commercial/contributions-utilities',
    'raw-loader!common/views/acquisitions-epic-control.html',
    'common/modules/commercial/acquisitions-copy',
    'common/modules/commercial/acquisitions-epic-testimonial-parameters',
    'common/modules/commercial/acquisitions-post-election'
], function (
    contributionsUtilities,
    epicControlTemplate,
    acquisitionsCopy,
    acquisitionsTestimonialParameters,
    acquisitionsPostElection
) {



    return contributionsUtilities.makeABTest({
        id: 'AcquisitionsEpicAlwaysAskElection',
        campaignId: 'epic_always_ask_election',

        start: '2017-06-01',
        expiry: '2018-07-19',

        author: 'Jonathan Rankin',
        description: 'This will guarantee that the epic is always displayed on election stories',
        successMeasure: 'Conversion rate',
        idealOutcome: 'We can always show the epic on election articles',
        audienceCriteria: 'All',
        audience: 1,
        locations: ['GB'],
        audienceOffset: 0,
        useTargetingTool: true,

        variants: [
            {
                id: 'control',
                isUnlimited : true,
                useTailoredCopyForRegulars: true
            },
            {
                id: 'post_election_message',
                isUnlimited: true,
                template: acquisitionsPostElection.template
            }
        ]
    });
});
