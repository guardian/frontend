define([
    'common/utils/$',
    'common/utils/config',
    'common/modules/experiments/tests/utils/comment-blocker'
], function (
    $,
    config,
    CommentBlocker
) {
        return function () {
            this.id = 'HideEvenComments';
            this.start = '2016-05-15';
            this.expiry = '2016-06-06';
            this.author = 'Nathaniel Bennett';
            this.description = 'Hide comments for a percentage of users to determine what effect it has on their dwell time and loyalty ';
            this.audience = 0.1;
            this.audienceOffset = 0.5;
            this.successMeasure = 'We want to guage how valuable comments actually are to us';
            this.audienceCriteria = 'All users';
            this.dataLinkNames = '';
            this.idealOutcome = 'DO we want to turn comments up or down';

            this.canRun = function () {
                return true;
            };

            this.isContent = !/Network Front|Section|Tag/.test(config.page.contentType);

            this.variants = [
                {
                    id: 'hide-comments',
                    test: function(){
                        console.log("++++++++++++++++++++++ WOTCHKA");
                        var isContent = !/Network Front|Section|Tag/.test(config.page.contentType),//,
                            hide = CommentBlocker.hideComments();

                        console.log("++ Hide Da Comments: .." + isContent + " Hide: " + hide);
                        if(isContent && hide) {
                            console.log("++ Hiding comments on this article");
                            $('.discussion').addClass('discussion--hidden');
                        }
                    }
                },
                {
                    id: 'control',
                    test: function(){}
                }
            ];
        };
    }
);

