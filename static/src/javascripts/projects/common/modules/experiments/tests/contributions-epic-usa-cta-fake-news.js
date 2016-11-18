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
             ajax,
             commercialFeatures,
             intersection) {

    return function () {

        this.id = 'ContributionsEpicUsaCtaFakeNews';
        this.start = '2016-11-18';
        this.expiry = '2016-11-22';
        this.author = 'Jonathan Rankin';
        this.description = 'Test just contributions vs contributions or membership in the US, and test a new copy variant against the control';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions / supporter sign ups';
        this.audienceCriteria = 'Just the US';
        this.dataLinkNames = '';
        this.idealOutcome = 'We prove or disprove our hypothesis that just offering contributions will result in an overall boost in money taken in the USA, whilst simultanously running a test to try and beat the epic control copy';
        this.canRun = function () {
            var includedKeywordIds = [
                'us-news/us-elections-2016',
                'us-news/us-politics'
            ];

            var excludedKeywordIds = ['music/leonard-cohen'];

            var hasKeywordsMatch = function() {
                var pageKeywords = config.page.keywordIds;
                if (typeof(pageKeywords) !== 'undefined') {
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

        var contributeUrlPrefix = 'co_global_epic_usa_cta_fake';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_usa_cta_fake';


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

            fake: {
                title: 'Since you’re here …',
                p1: '… we have a small favour to ask. In these post-truth times, when fake news swirls, we need independent journalism more than ever. But while more people are reading the Guardian, far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. Our journalism takes time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                intcmp: '_fake'
            }
        };

        var cta = {
            equal: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution',
                url1: makeUrl(membershipUrl, membershipUrlPrefix ),
                url2:  makeUrl(contributeUrl, contributeUrlPrefix ),
                hidden: ''
            },

            justContribute: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Make a contribution',
                cta2: '',
                url1:  makeUrl(contributeUrl, contributeUrlPrefix + '_backup'),
                url2: '',
                hidden: 'hidden'
            },

            justSupporter: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: '',
                url1: makeUrl(membershipUrl, membershipUrlPrefix + '_backup'),
                url2: '',
                hidden: 'hidden'
            }


        };

        var componentWriter = function (component) {
            ajax({
                url: 'https://api.nextgen.guardianapps.co.uk/geolocation',
                method: 'GET',
                contentType: 'application/json',
                crossOrigin: true
            }).then(function (resp) {
                if ('country' in resp && resp.country === 'US'){
                    fastdom.write(function () {
                        var submetaElement = $('.submeta');
                        if (submetaElement.length > 0) {
                            component.insertBefore(submetaElement);
                            mediator.emit('contributions-embed:insert', component);
                        }
                    });
                }
            });
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:view', complete);
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
                id: 'mixed-control',

                test: function () {
                    var ctaType = getCta();
                    var message = messages.control;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + message.intcmp + '_mixed',
                        linkUrl2: ctaType.url2 + message.intcmp + '_mixed',
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
                id: 'mixed-fake',

                test: function () {
                    var ctaType = getCta();
                    var message = messages.fake;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + message.intcmp + '_mixed',
                        linkUrl2: ctaType.url2 + message.intcmp + '_mixed',
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
                id: 'just-contribute-control',

                test: function () {
                    var ctaType = cta.justContribute;
                    var message = messages.control;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + message.intcmp + '_contribute',
                        linkUrl2: ctaType.url2 + message.intcmp + '_contribute',
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
                id: 'just-contribute-fake',

                test: function () {
                    var ctaType = cta.justContribute;
                    var message = messages.fake;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + message.intcmp + '_contribute',
                        linkUrl2: ctaType.url2 + message.intcmp + '_contribute',
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
