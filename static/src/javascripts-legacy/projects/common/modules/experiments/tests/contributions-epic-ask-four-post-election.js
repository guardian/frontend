define([
    'common/modules/commercial/contributions-utilities',
    'common/modules/commercial/acquisitions-post-election'
], function (
    contributionsUtilities,
    acquisitionsPostElection
) {

   return contributionsUtilities.makeABTest({
        id: 'ContributionsEpicAskFourPostElection',
        campaignId: 'kr1_epic_ask_four_post_election',

        start: '2017-07-07',
        expiry: '2017-08-07',

        author: 'Joseph Smith',
        description: 'This tests a custom post-election epic on all articles for UK users, with a limit of 4 impressions in any given 30 days',
        successMeasure: 'Conversion rate',
        idealOutcome: 'Custom post-election messages performs at least as well as the control',

        audienceCriteria: 'All',
        audience: 1,
        locations: ['GB'],

        audienceOffset: 0,

        variants: [
            {
                id: 'control',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },

                useTailoredCopyForRegulars: true,
                successOnView: true
            },
            {
                id: 'post_election_message',
                maxViews: {
                    days: 30,
                    count: 4,
                    minDaysBetweenViews: 0
                },

                template: acquisitionsPostElection.template,
                successOnView: true
            }
        ]
    });
});
