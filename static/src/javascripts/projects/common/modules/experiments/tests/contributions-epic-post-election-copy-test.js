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
        this.description = 'Try out 2 new epic variants and try an beat our control';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions/supporter sign ups';
        this.audienceCriteria = 'Global';
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
            control: {
                title: 'Since you’re here …',
                p1: '… we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                intcmp: '_control'
            },
            despair: {
                title: 'After despair …',
                p1: '… comes action. When US policy on climate change, race and immigration, reproductive rights, gun control, surveillance and LGBT rights all hang in the balance, journalism rooted in progressive values has never been more important. Now is the time to fund our fearless reporting and diverse voices, to help us hold President-elect Donald Trump and his administration to account. The Guardian’s independent, investigative journalism is expensive and difficult to produce. But we do it because we believe our perspective matters.',
                intcmp: '_despair'
            },
            belief: {
                title: 'When politicians defy belief …',
                p1: '… you need journalism that defies politicians. President-elect Donald Trump has threatened to weaken first amendment protections for reporters. He has said he will sue news organisations. He has labelled the press “dishonest” and “scum”. At times like this, free and fearless investigative journalism is never more important. The Guardian is not for dividend. We have no billionaire owner. All proceeds are reinvested in our independent journalism, which over the next four years will continue to uncover the truth, sort fact from fiction, and hold the new administration to account.',
                intcmp: '_belief'

            }
        };

        var cta = {
            equal: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution',
                url1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_postelectiontwo'),
                url2:  makeUrl(contributeUrl, contributeUrlPrefix + 'equal_postelectiontwo'),
                hidden: ''
            },

            justContribute: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Make a contribution',
                cta2: '',
                url1:  makeUrl(contributeUrl, contributeUrlPrefix + 'equal_postelectiontwo_backup'),
                url2: '',
                hidden: 'hidden'
            },

            justSupporter: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: '',
                url1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_postelectiontwo_backup'),
                url2: '',
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
                    var message = messages.control;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + message.intcmp,
                        linkUrl2: ctaType.url2 + message.intcmp,
                        title: message.title,
                        p1: message.p1,
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
                id: 'despair',

                test: function () {

                    var ctaType = getCta();
                    var message = messages.despair;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + message.intcmp,
                        linkUrl2: ctaType.url2 + message.intcmp,
                        title: message.title,
                        p1: message.p1,
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
                id: 'belief',

                test: function () {

                    var ctaType = getCta();
                    var message = messages.belief;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + message.intcmp,
                        linkUrl2: ctaType.url2 + message.intcmp,
                        title: message.title,
                        p1: message.p1,
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
