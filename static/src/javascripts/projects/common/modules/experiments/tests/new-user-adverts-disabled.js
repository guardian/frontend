define([
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/storage',
    'common/utils/detect'
], function (
    config,
    cookies,
    storage,
    detect
) {
    return function () {
        this.id = 'NewUserAdvertsDisabled';
        this.start = '2016-05-23';
        this.expiry = '2016-07-01';
        this.author = 'David Furey';
        this.description = 'Enable adfree experience for 3 days for new users.';
        this.audience = 0.1; // keep this is sync with values in applyAdfreeRenderCondition.scala.js
        this.audienceOffset = 0; // keep this is sync with values in applyAdfreeRenderCondition.scala.js
        this.audienceCriteria = 'First time users';
        this.idealOutcome = 'People come back more after the first visit.';

        this.canRun = function () {
            if (storage.local.isStorageAvailable() && !detect.isIOS() && detect.getUserAgent.browser !== 'Safari') {
                var alreadyVisited = storage.local.get('gu.alreadyVisited') || 0;
                return alreadyVisited == 0;
            } else {
                return false;
            }
        };

        this.variants = [{
            id: 'variant',
            test: function () {
                cookies.add('gu_adfree_test', 'variant');
            }
        }, {
            id: 'control',
            test: function () {
                cookies.add('gu_adfree_test', 'control');
            }
        }];

    };

});
