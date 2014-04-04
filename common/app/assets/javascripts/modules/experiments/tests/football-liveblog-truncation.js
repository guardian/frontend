define([
    'common/$',
    'bean',
    'common/utils/detect'
], function(
    $,
    bean,
    detect
) {
    var $blocks,
        visible = 5,
        $cta = $.create('<button type="button" class="truncation-cta truncation-cta--continue js-continue-reading u-fauxlink" data-link-name="continue reading"><i class="i i-arrow-down-double-blue"></i>Continue reading</button>');

    var FootballLiveblogTruncation= function() {

        this.id = 'FootballLiveblogTruncation';
        this.start = '2014-04-04';
        this.expiry = '2014-04-12';
        this.author = 'James Gorrie';
        this.description = 'Truncate football liveblogs.';
        this.audience = 0.5;
        this.audienceOffset = 0.2;
        this.successMeasure = 'Dwell time.';
        this.audienceCriteria = 'Users viewing an a football liveblog.';
        this.dataLinkNames = 'football liveblog truncated';
        this.idealOutcome = 'People will become more engaged and will increase return visits in the future.';

        this.canRun = function(config) {
            return config.page.section === 'football' && config.page.isLiveBlog === true && detect.getBreakpoint() === 'mobile';
        };

        this.variants = [
            {
                id: 'control',
                test: function() {}
            },
            {
                id: 'truncated',
                test: function(context) {
                    $blocks = $('.live-blog__blocks .block', context);
                    $($blocks.each(function(el, i) {
                        if (i >= visible) {
                            el.setAttribute('hidden', 'hidden');
                        }
                    }).get(visible-1)).after($cta);

                    $cta.each(function(el) {
                        bean.on(el, 'click', function() {
                            $blocks.each(function(block) {
                                block.removeAttribute('hidden');
                            });
                            $(el).addClass('u-h');
                        });
                    });
                }
            }
        ];
    };

    return FootballLiveblogTruncation;

});