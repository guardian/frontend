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
    'common/modules/experiments/embed',
    'common/utils/ajax',
    'common/modules/commercial/commercial-features',
    'lodash/arrays/intersection'

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
             embed,
             ajax,
             commercialFeatures,
             intersection) {

    return function () {

        this.id = 'ContributionsEpicPostElectionCopyTestTwo';
        this.start = '2016-11-14';
        this.expiry = '2016-11-18';
        this.author = 'Jonathan Rankin';
        this.description = 'Try out 2 new epic variants to try an beat our control';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'Global ';
        this.dataLinkNames = '';
        this.idealOutcome = 'We learn to what extend using messages that chime with current events have an impact on contributor/supporter conversion';
        this.canRun = function () {
            var includedKeywordIds = [
                'australia-news/australia-news',
                'politics/politics',
                'politics/eu-referendum',
                'society/society',
                'uk/media',
                'uk/uk',
                'us/environment',
                'us-news/us-news',
                'us-news/us-politics',
                'us-news/us-elections-2016',
                'us/business',
                'world/world'
            ];

            var excludedKeywordIds = ['music/leonard-cohen'];

            var hasKeywordsMatch = function() {
                var pageKeywords = config.page.keywordIds;
                if (typeof(pageKeywords) != 'undefined') {
                    var keywordList = pageKeywords.split(',');
                    return intersection(excludedKeywordIds, keywordList).length == 0 &&
                        intersection(includedKeywordIds, keywordList).length > 0;
                } else {
                    return false;
                }
            };

            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate && hasKeywordsMatch();
        };

        var contributeUrlPrefix = 'co_global_epic_two_';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_post_two_';


        var makeUrl = function(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        };

        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';

        var messages  = {
            control:  '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
            v1:  'NEW COPY',
            v2:  'NEW COPY 2'
        };

        var cta = {
            equal: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution',
                intcmp1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_postelection_1c'),
                intcmp2:  makeUrl(contributeUrl, contributeUrlPrefix + 'equal_postelection_1c'),
                hidden: ''
            },

            justContribute: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Make a contribution',
                cta2: '',
                intcmp1:  makeUrl(contributeUrl, contributeUrlPrefix + 'equal_postelection_1c_backup'),
                intcmp2: '',
                hidden: 'hidden'
            },

            justSupporter: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: '',
                intcmp1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_postelection_1c_backup'),
                intcmp2: '',
                hidden: 'hidden'
            }


        };

        var componentWriter = function (component) {
            fastdom.write(function () {
                var submetaElement = $('.submeta');

                if (submetaElement.length > 0) {
                    component.insertBefore(submetaElement);
                    embed.init();
                    mediator.emit('contributions-embed:insert', component);
                }
            });
        };



        var completer = function (complete) {
            mediator.on('contributions-embed:insert', complete);
        };

        var getCta = function() {
            if (config.switches.turnOffSupporterEpic) {
                return cta.justContribute;
            }
            if (config.switches.turnOffContributionsEpic) {
                return cta.justSupporter;
            }
            return cta.equal;
        };


        this.variants = [
            {
                id: 'control',

                test: function () {

                    var ctaType = getCta();
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.intcmp1,
                        linkUrl2: ctaType.intcmp2,
                        p1: messages.control,
                        p2:ctaType.p2,
                        p3: ctaType.p3,
                        cta1: ctaType.cta1,
                        cta2: ctaType.cta2,
                        hidden: ctaType.hidden
                    }));
                    componentWriter(component);
                },

                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },

                success: completer
            },

            {
                id: 'v1',

                test: function () {

                    var ctaType = getCta();
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.intcmp1,
                        linkUrl2: ctaType.intcmp2,
                        p1: messages.v1,
                        p2:ctaType.p2,
                        p3: ctaType.p3,
                        cta1: ctaType.cta1,
                        cta2: ctaType.cta2,
                        hidden: ctaType.hidden
                    }));
                    componentWriter(component);
                },

                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },

                success: completer
            },

            {
                id: 'v2',

                test: function () {

                    var ctaType = getCta();
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.intcmp1,
                        linkUrl2: ctaType.intcmp2,
                        p1: messages.v2,
                        p2:ctaType.p2,
                        p3: ctaType.p3,
                        cta1: ctaType.cta1,
                        cta2: ctaType.cta2,
                        hidden: ctaType.hidden
                    }));
                    componentWriter(component);
                },

                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },

                success: completer
            }
        ];
    };
});
