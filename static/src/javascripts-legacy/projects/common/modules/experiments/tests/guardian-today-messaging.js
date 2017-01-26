define([], function () {
    return function () {
        this.id = 'GuardianTodaySignupMessaging';
        this.start = '2017-01-01';
        this.expiry = '2017-02-02';
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

        // test behaviour is implemented in email-article.js
        this.variants = [
            {
                id: 'message-a',
                test: function () {}
            },
            {
                id: 'message-b',
                test: function () {}
            },
            {
                id: 'message-c',
                test: function () {}
            }
        ];
    };
});
