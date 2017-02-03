define([
    'common/utils/mediator'
], function (
    mediator
) {
    return function () {
        this.id = 'TailorRecommendedEmail';
        this.start = '2017-01-23';
        this.expiry = '2017-03-31';
        this.author = 'Lindsey Dew';
        this.description = 'Using Tailor to target email signup form';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'We can trial a tailor recommeded email format against a standard email format';
        this.audienceCriteria = 'All users who visit article pages';
        this.dataLinkNames = '';
        this.idealOutcome = 'Tailor recommended email list has a higher sign-up than standard';

        this.canRun = function () {
          return true;
        }

        function runTheTest(isControl) {
            if (isControl) {
                console.log('control');
            } else {
                console.log('tailor');
            }
        }

        this.variants = [
            {
                id: 'control',
                test: function () {
                    runTheTest(true);
                },
                impression: function(track) {
                    mediator.on('control:insert', function () {
                        track();
                    });
                },
                success: function(complete) {
                    mediator.on('control:signup', function () {
                        complete();
                    });
                }
            },
            {
                id: 'tailor-recommended',
                test: function () {
                    runTheTest(false);
                },
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

            }
        ];
    };
});
