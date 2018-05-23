// @flow

export const audioPageHideImage : ABTest = {
    id: 'AudioPageHideImage',
    start: '2018-05-25',
    expiry: '2018-06-25',
    author: 'Anna Leach',
    description: 'Hide the trail image on the audio player page',
    audience: 0.1, // ?
    audienceOffset: 0.4, // ?
    successMeasure: 'Audio plays & podcast subscribes',
    audienceCriteria: 'Users who are not on app, viewing an audio page.',
    dataLinkNames: '',
    idealOutcome: 'Plays are increased on audio pages when the image is removed',

    canRun: () => {
        config.page.contentType === 'Audio'
    },

    variants: [
        {
            id: 'control',
            test(context, config) {},

            impression(track) {
                /* call track() when the impression should be registered
                  (e.g. your element is in view) */
            },

            success(complete) {
                /* do something that determines whether the user has completed
                   the test (e.g. set up an event listener) and call 'complete'
                   afterwards */

                complete();
            }
        },
        {
            id: 'hide-image',
            test(context, config) {
                context.querySelector('.trail-image').classList.add('hidden');
            },

            impression(track) {
                track()
            },

            success(complete) {
                complete();
            }
        }
    ]

};
