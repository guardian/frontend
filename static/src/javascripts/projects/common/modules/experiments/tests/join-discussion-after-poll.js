define([
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/detect',
    'common/utils/$',
    'common/modules/experiments/join-discussion-after-poll'
], function (
    config,
    mediator,
    detect,
    $,
    joinDiscussionMessage
) {

    function variantSuccess(complete) {
        if (this.canRun()) {
            mediator.on('discussion:commentbox:post:success',  function () {
                // if poll has been submitted
                if (joinDiscussionMessage.isComplete()) {
                    // data lake
                    complete();
                }
            });
        }
    }

    function variantTest(isControl) {
        joinDiscussionMessage.init(isControl);
    }

    return function () {
        this.id = 'JoinDiscussionAfterPoll';
        this.start = '2016-06-15';
        this.expiry = '2016-07-27';
        this.author = 'George Haberis - Participation';
        this.description = 'Participation - Does "join discussion" message after poll participation increase comments';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.successMeasure = 'Control - User does not see message, Variant 1 - User sees message';
        this.audienceCriteria = 'Articles which have embeded poll';
        this.dataLinkNames = '';
        this.idealOutcome = 'We can see at least 50% more participation if message shown';

        this.canRun = function () {
            // Must be commentable page with poll
            return detect.isEnhanced() && config.page.commentable && $('figure.element-interactive[data-canonical-url*="interactive.guim.co.uk/participation/poll"]').length > 0;
        };

        this.variants = [
            {
                id: 'control',
                test: variantTest.bind(this, true),
                success: variantSuccess.bind(this)
            },
            {
                id: 'variant-1',
                test: variantTest.bind(this, false),
                success: variantSuccess.bind(this)
            }
        ];
    };
});
