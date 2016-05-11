define([
    // 'common/utils/$',
    // 'common/utils/config',
    // 'common/utils/storage'
], function(
     // $,
     // config,
     // storage
) {
    return function () {
        this.id = 'CleverFriendSegment';
        this.start = '2016-05-09';
        this.expiry = '2016-07-31';
        this.author = 'Anne Byrne';
        this.description = 'Segmentation to target users with Clever Friend';
        this.audience = 0.55;
        this.audienceOffset = 0.4;
        this.successMeasure = 'We want to segment users, so that only 1% are targeted with Clever Friend - the Brexit Companion.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'We want a sample of users, 1% of our audience, to see Clever Friend on Brexit news articles.';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'remove-embed',
            test: function() {
                alert();
                // var companion = document.querySelectorAll("figure[href^='https://interactive.guim.co.uk/2016/05/brexit-companion/']");
                // companion.parentNode.removeChild(companion);
            }
        }];

    };

});
