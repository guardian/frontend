define([
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/user-prefs'
], function (
    config,
    mediator,
    userPrefs
){

    return function() {

        var module = this;

        this.id = 'ParticipationDiscussionOrdering';
        this.start = '2016-07-25';
        this.expiry = '2016-08-26';
        this.author = 'Nathaniel Bennett';
        this.description = 'Changes the default ordering of comments so we can determine whether sorting by recommended causes more users to view comments';
        this.audience = 0.1;
        this.audienceOffset = 0.6;
        this.successMeasure = '';
        this.showForSensitive = true;
        this.audienceCriteria = 'All';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function() {
            //If a user has already ordered comments, let's not knob them about
            var preferredOrdering = userPrefs.get('discussion.order') || 'none';
            return config.page.commentable && preferredOrdering === 'none';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {}
            },
            {
                id: 'order-by-oldest',
                test: function() {
                    userPrefs.set('discussion.order.test', 'oldest');
                },
                success: function(complete) {
                    if(module.canRun()) {
                        mediator.on('discussion:comments:get-more-replies', complete);
                    }
                }
            },
            {
                id: 'order-by-newest',
                test: function() {
                    userPrefs.set('discussion.order.test', 'newest');
                },
                success: function(complete) {
                    if(module.canRun()) {
                        mediator.on('discussion:comments:get-more-replies', complete);
                    }
                }
            },
            {
                id: 'order-by-recommended',
                test: function() {
                    userPrefs.set('discussion.order.test', 'recommendations');
                },
                success: function(complete) {
                    if(module.canRun()) {
                        mediator.on('discussion:comments:get-more-replies', complete);
                    }
                }
            }
        ];


    };
});
