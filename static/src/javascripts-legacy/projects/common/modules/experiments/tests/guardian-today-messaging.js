define([
    'common/utils/mediator'
], function (mediator) {
    return function () {
        this.id = 'GuardianTodaySignupMessaging';
        this.start = '2017-01-01';
        this.expiry = '2017-03-28';
        this.author = 'David Furey';
        this.description = 'Test 3 different messages to encourage users to signup to the Guardian Today email newsletter';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = 'Signup rate is higher for one variant';
        this.audienceCriteria = 'All users who visit an applicable article';
        this.dataLinkNames = '';
        this.idealOutcome = 'Signup rate is higher for one variant';

        this.canRun = function () {
            return true;
        };

        function createVariant(id) {
            return {
                id: id,
                test: function () {}, // test behaviour is implemented in email-article.js
                impression: function(track) {
                    var eventName = 'GuardianTodaySignupMessaging:insert';
                    mediator.on(eventName, function () {
                        track();
                    });
                },
                success: function(complete) {
                    var eventName = 'GuardianTodaySignupMessaging:signup';
                    mediator.on(eventName, function () {
                        complete();
                    });
                }
            };
        }

        this.variants = [
            createVariant('message-a'),
            createVariant('message-b'),
            createVariant('message-c')
        ];
    };
});
