define([

], function() {
    return function () {
        this.id = 'CleverFriendBrexit';
        this.start = '2016-05-09';
        this.expiry = '2016-07-31';
        this.author = 'Anne Byrne';
        this.description = 'Only expose the clever friend embed to 10% of people, by removing it for 90%';
        this.audience = 0.9;
        this.audienceOffset = 0.0;
        this.successMeasure = 'Not really an a/b test, just using the audience segmentation for a soft launch';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [{
            id: 'remove-embed',
            test: function() {
                var companions = document.querySelectorAll('figure[data-canonical-url^="https://interactive.guim.co.uk/2016/05/brexit-companion/"]');
                for (var i = 0; i < companions.length; i++) {
                    companions[i].parentNode.removeChild(companions[i]);
                }
            }
        }];
    };
});
