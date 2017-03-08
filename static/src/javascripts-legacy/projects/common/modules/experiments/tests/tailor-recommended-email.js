define([
    'lib/mediator',
    'lib/storage'
], function (
    mediator,
    storage
) {
    return function () {
        this.id = 'TailorRecommendedEmail';
        this.start = '2017-01-23';
        this.expiry = '2017-03-31';
        this.author = 'Lindsey Dew';
        this.description = 'Using Tailor to target email signup form';
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = 'We can trial a tailor recommended email format against a standard email format';
        this.audienceCriteria = 'All users who visit article pages';
        this.dataLinkNames = '';
        this.idealOutcome = 'Tailor recommended email list has a higher sign-up than standard';

        this.canRun = function () {
            storage.local.isStorageAvailable();
        };

        this.variants = [
            {
                id: 'control',

                test: function () {},
                impression: function(track) {
                    mediator.on('tailor-control:insert', function () {
                        track();
                    });
                },
                success: function(complete) {
                    mediator.on('tailor-control:signup', function () {
                        complete();
                    });
                }
            },
            {
                id: 'tailor-recommended',
                test: function () {},
                impression: function(track) {
                    mediator.on('tailor-recommended:insert', function () {
                        track();
                    });
                },
                success: function(complete) {
                    mediator.on('tailor-recommend:signup', function () {
                        complete();
                    });
                }

            },
            {
                id: 'tailor-random',
                test: function() {},
                impression: function(track) {
                    mediator.on('tailor-random:insert', function () {
                        track();
                    });
                },
                success: function(complete) {
                    mediator.on('tailor-random:signup', function () {
                        complete();
                    });
                }
            }
        ];
    };
});
