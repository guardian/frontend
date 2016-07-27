define([
    'common/utils/config',
    'common/modules/user-prefs'
], function (
    config,
    userPrefs
){

    return function() {
        this.id = 'ParticipationDiscussionOrdering';
        this.start = '2016-07-25';
        this.expiry = '2016-08-26';
        this.author = 'Nathaniel Bennett';
        this.description = 'Changes the default ordering of comments so we can determine whether sorting by recommended causes more users to view comments';
        this.audience = 0.1;
        this.audienceOffset = 0.0;
        this.successMeasure = '';
        this.showForSensitive = true;
        this.audienceCriteria = 'All';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function() {

            //If a user has ordered comments, let's not knob them about
            var preferredOrdering = userPrefs.get('discussion.order') || 'none';
            console.log("+++++++++++++++++++++=  Hello Miss milksteamer! " + config.page.commentable + " Ordering: " + preferredOrdering === 'none');
            return config.page.commentable && preferredOrdering === 'none';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    console.log("++++++++++++++++++++ Oldest");
                }
            },
            {
                id: 'order-by-oldest',
                test: function() {
                    console.log("++++++++++++++++++++ Oldest");
                    userPrefs.set('discussion.order', 'oldest');
                }
            },
            {
                id: 'order-by-newest',
                test: function() {
                    console.log("++++++++++++++++++++ Newest");
                    userPrefs.set('discussion.order', 'newest');
                }
            },
            {
                id: 'order-by-recommended',
                test: function() {
                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Recommend");
                    userPrefs.set('discussion.order', 'recommendations');
                }
            }
        ];


    };
});
