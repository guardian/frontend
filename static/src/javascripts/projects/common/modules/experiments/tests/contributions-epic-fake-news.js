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
    'lodash/arrays/intersection',
    'common/utils/element-inview'

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
             intersection,
             ElementInview) {

    return function () {

        this.id = 'ContributionsEpicFakeNews';
        this.start = '2016-11-18';
        this.expiry = '2016-11-22';
        this.author = 'Jonathan Rankin';
        this.description = 'Try and beat the epic copy with a version that mentions the hot topic of fake news';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions / supporter sign ups';
        this.audienceCriteria = 'Everywhere but the US';
        this.dataLinkNames = '';
        this.idealOutcome = 'We find a message that beats our copy, and learn that we can beat the current control copy with news-relevant references in the copy';
        this.canRun = function () {
            var includedKeywordIds = [
                'us-news/us-elections-2016',
                'us-news/us-politics'
            ];

            var includedNonKeywordTagIds = [
                'uk-news/series/the-new-world-of-work'
            ];

            var excludedKeywordIds = ['music/leonard-cohen'];

            var hasKeywordsMatch = function() {
                var pageKeywords = config.page.keywordIds;
                var pageNonKeywordTagIds = config.page.nonKeywordTagIds;
                if (typeof(pageKeywords) !== 'undefined' && typeof(pageNonKeywordTagIds) !== 'undefined') {
                    var keywordList = pageKeywords.split(',');
                    var nonKeywordTagIdsList = pageNonKeywordTagIds.split(',');
                    return (intersection(excludedKeywordIds, keywordList).length == 0
                        && (intersection(includedKeywordIds, keywordList).length > 0) || intersection(includedNonKeywordTagIds, nonKeywordTagIdsList).length > 0);
                } else {
                    return false;
                }
            };

            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate && hasKeywordsMatch();
        };

        function getValue(name){
            return parseInt(cookies.get(name));
        }

        function setValue(name, value){
            cookies.add(name, value, 7);
        }

        function addInviewListener(epicViewCounter) {
            mediator.on('contributions-embed:insert', function () {
                $('.contributions__epic').each(function (el) {
                    //top offset of 18 ensures view only counts when half of element is on screen
                    var elementInview = ElementInview(el, window, {top: 18});
                    elementInview.on('firstview', function () {
                        mediator.emit('contributions-embed:view');
                        setValue('gu.epicViewCount', epicViewCounter + 1);
                    });
                });
            });
        }

        var epicViewCount = getValue('gu.epicViewCount') || 0;



        var contributeUrlPrefix = 'co_global_epic_fake_not_us';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_fake_not_us';


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
                if (epicViewCount < 4 && 'country' in resp && resp.country !== 'US'){
                    fastdom.write(function () {
                        var submetaElement = $('.submeta');
                        if (submetaElement.length > 0) {
                            component.insertBefore(submetaElement);
                            addInviewListener(epicViewCount);
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
                id: 'fake',

                test: function () {
                    var ctaType = getCta();
                    var message = messages.fake;
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
