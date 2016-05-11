define([

], function() {
    return function () {
        this.id = 'CleverFriendBrexit';
        this.start = '2016-05-09';
        this.expiry = '2016-07-31';
        this.author = 'Anne Byrne';
        this.description = 'Segmentation to target users with Clever Friend';
        this.audience = 0.0;
        this.audienceOffset = 0.0;
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
                var companions = document.querySelectorAll('figure[data-canonical-url^="https://interactive.guim.co.uk/2016/05/brexit-companion/"]');
                for (var i = 0; i < companions.length; i++) {
                    companions[i].remove();
                }
            }
        }];
    };
});
