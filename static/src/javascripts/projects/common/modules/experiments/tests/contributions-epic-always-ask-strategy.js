define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-epic-equal-buttons.html',
    'common/utils/robust',
    'inlineSvg!svgs/icon/arrow-right',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/ajax',
    'common/modules/commercial/commercial-features'

], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsEpicEqualButtons,
             robust,
             arrowRight,
             config,
             cookies,
             ajax,
             commercialFeatures) {

    return function () {
        this.id = 'ContributionsEpicAlwaysAskStrategy';
        this.start = '2016-12-07';
        this.expiry = '2017-01-06';
        this.author = 'Guy Dawson';
        this.description = 'Test to assess the effects of always asking readers to contribute via the Epic over a prolonged period.';
        this.showForSensitive = false;
        this.audience = 0.05;
        this.audienceOffset = 0.85;
        this.successMeasure = 'We are able to measure the positive and negative effects of this strategy.';
        this.audienceCriteria = 'All';
        this.dataLinkNames = '';
        this.idealOutcome = 'There are no negative effects and this is the optimum strategy!';

        // Setting this to true enables an easy data lake query to see whether a reader is in the test segment:
        // check whether the ab_tests field contains a test with name ContributionsEpicAlwaysAskStrategy.
        // The logic for whether the test-variant is displayed, is contained in the test() function for the
        // respective variant (see below).
        this.canRun = function () {
            return true;
        };

        var contributeUrlPrefix = 'co_global_epic_always_ask_strategy';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_always_ask_strategy';


        var makeUrl = function(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        };

        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';

        var messages  = {
            control: {
                title: 'Since you’re here …',
                p1: '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.'
            }
        };

        var cta = {
            equal: {
                p2: 'If everyone who reads our reporting, who likes it, helps to pay for it, our future would be much more secure.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution',
                url1: makeUrl(membershipUrl, membershipUrlPrefix),
                url2:  makeUrl(contributeUrl, contributeUrlPrefix),
                hidden: ''
            }
        };

        var componentWriter = function (component) {
            fastdom.write(function () {
                var submetaElement = $('.submeta');
                if (submetaElement.length > 0) {
                    component.insertBefore(submetaElement);
                    mediator.emit('contributions-embed:insert', component);
                }
            });
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:view', complete);
        };

        this.variants = [
            {
                id: 'control',

                test: function () {
                    var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
                    var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
                    var canRun = userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate;

                    if (canRun) {
                        var ctaType = cta.equal;
                        var message = messages.control;
                        var component = $.create(template(contributionsEpicEqualButtons, {
                            linkUrl1: ctaType.url1 + '_control',
                            linkUrl2: ctaType.url2 + '_control',
                            title: message.title,
                            p1: message.p1,
                            p2:ctaType.p2,
                            p3: ctaType.p3,
                            cta1: ctaType.cta1,
                            cta2: ctaType.cta2,
                            hidden: ctaType.hidden
                        }));
                        componentWriter(component);
                    }
                },

                success: completer
            }
        ];
    };
});
