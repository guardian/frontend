define([
    'bonzo',
    'common/$',
    'common/modules/onward/history',
    'common/utils/cookies'
], function (
    bonzo,
    $,
    History,
    cookies
    ) {

    return function () {

        this.id = 'HideSupportingLinks';
        // not starting the test just yet, in now so we can style the component correctly for this spot
        this.start = '2014-05-28';
        this.expiry = '2014-06-24';
        this.author = 'Raul Tudor';
        this.description = 'Test user retention upon hiding the article supporting links on facia fronts';
        this.audience = 0.08;
        this.audienceOffset = 0.92;
        this.successMeasure = 'Click through rates on front overall and clicks on news container';
        this.audienceCriteria = 'Audience to the fronts';
        this.dataLinkNames = 'Hide supporting links on mobile';
        this.idealOutcome = 'Ideal outcome is that click through is increased overall';

        var appConfig;

        function getSublinks(){
            return $('.supporting-links[data-lead-story-url]');
        }

        this.canRun = function (config) {
            appConfig = config;
            return config.page.isFront;
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    // do nothing
                }
            },
            {
                id: 'hide-all',
                test: function () {
                    getSublinks().hide();
                }
            },
            {
                id: 'show-visited',
                test: function () {
                    var history = new History();

                    getSublinks().each(function(item){
                        var trail = bonzo(item);
                        var leadSlug = trail.attr('data-lead-story-url');

                        if(!history.contains(leadSlug)){
                            trail.hide();
                        }
                    });
                }
            },
            {
                id: 'show-if-homepage',
                test: function () {
                    var cookieName = 'HideSupportingLinks-show-if-homepage-' + appConfig.page.edition;
                    var isEditionHomepage =
                        appConfig.page.pageId == 'uk' ||
                        appConfig.page.pageId == 'us' ||
                        appConfig.page.pageId == 'au';

                    if (isEditionHomepage) {
                        var homepageVisited = cookies.get(cookieName);

                        if (!homepageVisited) {
                            getSublinks().hide();
                            var minutesToLive = 180;
                            cookies.addForMinutes(cookieName, 'true', minutesToLive);
                        }
                    }
                }
            }
        ];
    };

});
