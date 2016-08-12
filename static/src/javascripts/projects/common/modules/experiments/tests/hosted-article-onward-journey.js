define([
    'bean',
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'lodash/collections/contains'
], function (
    bean,
    fastdom,
    qwery,
    $,
    config,
    detect,
    contains
) {
    return function () {
        this.id = 'HostedArticleOnwardJourney';
        this.start = '2016-08-12';
        this.expiry = '2016-09-16';
        this.author = 'Lydia Shepherd';
        this.description = 'Vertical positioning of the onward journey (links to other pages in the campaign)';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'People will click on the onward journey links more often.';
        this.audienceCriteria = 'All users on hosted article pages on desktop';
        this.dataLinkNames = 'Next Hosted Page: Singapore Airlines Singapore Grand Prix packages, Next Hosted Page: Get the most out of the Singapore Grand Prix, Next Hosted Page: Get revved up for the Singapore Grand Prix';
        this.idealOutcome = 'People will click on the onward journey links more often.';

        this.canRun = function () {
            return config.isHosted && config.page.section === 'singapore-grand-prix' && contains(['desktop', 'leftCol', 'wide'], detect.getBreakpoint());
        };

        this.variants = [
            {
                id: 'top',
                test: function () {},
                success: function (complete) {
                    var hostedBanner = qwery('.hosted__next-video--tile');
                    if (hostedBanner.length == 2) {
                        bean.on(hostedBanner[0], 'click', complete);
                        bean.on(hostedBanner[1], 'click', complete);
                    }
                }
            },
            {
                id: 'middle',
                test: function () {
                    fastdom.write(function () {
                        $('.hosted__next-video').css('top', '50%');
                    });
                },
                success: function (complete) {
                    var hostedBanner = qwery('.hosted__next-video--tile');
                    if (hostedBanner.length == 2) {
                        bean.on(hostedBanner[0], 'click', complete);
                        bean.on(hostedBanner[1], 'click', complete);
                    }
                }
            },
            {
                id: 'bottom',
                test: function () {
                    fastdom.write(function () {
                        $('.hosted__next-video').css('top', 'auto').css('bottom', '0');
                    });
                },
                success: function (complete) {
                    var hostedBanner = qwery('.hosted__next-video--tile');
                    if (hostedBanner.length == 2) {
                        bean.on(hostedBanner[0], 'click', complete);
                        bean.on(hostedBanner[1], 'click', complete);
                    }
                }
            }
        ];
    };
});
