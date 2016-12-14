define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-epic-image.html',
    'text!common/views/contributions-epic-equal-buttons.html',
    'common/utils/robust',
    'inlineSvg!svgs/icon/arrow-right',
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/ajax',
    'common/modules/commercial/commercial-features',
    'common/utils/element-inview',
    'lodash/arrays/intersection'
], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsEpicImage,
             contributionsEpicEqualButtons,
             robust,
             arrowRight,
             config,
             cookies,
             ajax,
             commercialFeatures,
             ElementInview,
             intersection) {

    // We want to ensure the test always runs as this enables an easy data lake query to see whether a reader is in the
    // test segment: check whether the ab_tests field contains a test with name ContributionsEpicAlwaysAskStrategy.
    // This means having showForSensitive equal to true, and the canRun() function always returning true.
    // The logic for whether the test-variant is displayed, is handled in the canBeDisplayed() function.
    return function () {
        this.id = 'ContributionsEpicOnTheMoon';
        this.start = '2016-12-13';
        this.expiry = '2017-01-12';
        this.author = 'Alex Dufournet';
        this.description = 'Test with Epic variant containing a message from First Dog on the Moon';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'We are able to measure the positive and negative effects of this strategy.';
        this.audienceCriteria = 'All';
        this.dataLinkNames = '';
        this.idealOutcome = 'There are no negative effects and this is the optimum strategy!';
        this.canRun = function () {

            var includedKeywordIds = ['politics/eu-referendum'];

            var includedSeriesIds = [];

            var excludedKeywordIds = [];

            var excludedSeriesIds = ['theobserver/series/the-observer-at-225'];

            var tagsMatch = function () {
                var pageKeywords = config.page.keywordIds;
                if (typeof(pageKeywords) !== 'undefined') {
                    var keywordList = pageKeywords.split(',');
                    return intersection(excludedKeywordIds, keywordList).length == 0 &&
                        excludedSeriesIds.indexOf(config.page.seriesId) === -1 &&
                        (intersection(includedKeywordIds, keywordList).length > 0 || includedSeriesIds.indexOf(config.page.seriesId) !== -1);
                } else {
                    return false;
                }
            };
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate && tagsMatch();
        };

        var makeEvent = (function(name) {
            return this.id + ':' + name;
        }).bind(this);

        function makeUrl(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        }

        var contributeUrlSuffix = 'co_au_epic_first_dog_on_the_moon';
        var membershipUrlSuffix = 'gdnwb_copts_mem_epic_first_dog_on_the_moon';

        var epicViewedEvent = makeEvent('view');

        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';

        var cta = {
            cta1: 'Become a Supporter',
            cta2: 'Make a contribution',
            url1: makeUrl(membershipUrl, membershipUrlSuffix),
            url2:  makeUrl(contributeUrl, contributeUrlSuffix),
            hidden: ''
        };

        var componentWriter = function (component) {
            ajax({
                url: config.page.ajaxUrl + '/geolocation',
                method: 'GET',
                contentType: 'application/json',
                crossOrigin: true
            }).then(function (resp) {
                if(resp.country === 'AU') {
                    fastdom.write(function () {
                        var submetaElement = $('.submeta');
                        if (submetaElement.length > 0) {
                            component.insertBefore(submetaElement);
                            $('.contributions__epic').each(function (element) {
                                // top offset of 18 ensures view only counts when half of element is on screen
                                var elementInview = ElementInview(element, window, {top: 18});
                                elementInview.on('firstview', function () {
                                    mediator.emit(epicViewedEvent, component);
                                });
                            });
                        }
                    });
                }
            });
        };

        var registerViewListener = function (complete) {
            mediator.on(epicViewedEvent, complete);
        };

        var canBeDisplayed = function() {
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            var isSensitive = config.page.isSensitive === true;
            return userHasNeverContributed &&
                commercialFeatures.canReasonablyAskForMoney &&
                worksWellWithPageTemplate &&
                !isSensitive;
        };

        this.variants = [
            {
                id: 'control',

                test: function () {
                    if (canBeDisplayed()) {
                        var component = $.create(template(contributionsEpicEqualButtons, {
                            linkUrl1: cta.url1 + '_control',
                            linkUrl2: cta.url2 + '_control',
                            title: 'Since you\'re here…',
                            p1: '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                            p2: 'If everyone who reads our reporting, who likes it, helps to pay for it our future would be much more secure.',
                            p3: '',
                            cta1: cta.cta1,
                            cta2: cta.cta2,
                            hidden: cta.hidden
                        }));
                        componentWriter(component);
                    }
                },

                success: registerViewListener
            },
            {
                id: 'showMeTheMoon',

                test: function () {
                    if (canBeDisplayed()) {
                        var component = $.create(template(contributionsEpicImage, {
                            linkUrl1: cta.url1,
                            linkUrl2: cta.url2,
                            cta1: cta.cta1,
                            cta2: cta.cta2,
                            defaultImgSrc: config.images.contributions['ab-first-dog-mb'],
                            alt: 'First Dog on the Moon supports the guardian',
                            sources: [
                                {src: config.images.contributions['ab-first-dog-dt'], media:'(min-width:580px)'},
                                {src: config.images.contributions['ab-first-dog-mb'], media:'(max-width:580px)'}
                            ],
                            hidden: cta.hidden
                        }));
                        componentWriter(component);
                    }
                },

                success: registerViewListener
            },
            {
                id: 'australiaNewsroom',

                test: function () {
                    if (canBeDisplayed()) {
                        var component = $.create(template(contributionsEpicEqualButtons, {
                            linkUrl1: cta.url1 + '_australiaNewsroom',
                            linkUrl2: cta.url2 + '_australiaNewsroom',
                            title: 'Since you’re here…',
                            p1: '…we have a favour to ask. Guardian Australia launched three years ago and although many people read it, few pay for it. We fund our content through advertising, but revenues across the media are falling fast. So we need your help. Our independent, investigative reporting takes a lot of time, money and hard work to produce.',
                            p2: 'Any money raised from readers goes directly to fund Guardian Australia\'s journalism, so if everyone who reads it – who believes in it – helps to support it, our future would be more secure.',
                            p3: '',
                            cta1: cta.cta1,
                            cta2: cta.cta2,
                            hidden: cta.hidden
                        }));
                        componentWriter(component);
                    }
                },

                success: registerViewListener
            },
            {
                id: 'endOfYearAustralia',

                test: function () {
                    if (canBeDisplayed()) {
                        var component = $.create(template(contributionsEpicEqualButtons, {
                            linkUrl1: cta.url1 + '_endOfYearAustralia',
                            linkUrl2: cta.url2 + '_endOfYearAustralia',
                            title: 'In 2017…',
                            p1: '…the pursuit of truth will matter more than ever. At a time when lies can be read as widely as facts, Guardian Australia holds an important place in the media landscape. But we need your help. Independent investigative journalism dedicated to holding the powerful to account​ and ensuring diverse, local voices are heard​ takes time and money. Next year we will shine a light on critical issues such as politics, climate, detention, minority voices and inequality.',
                            p2: 'If everyone who reads Guardian Australia – who believes in it – helps to support it, our ability to tell these stories will be more secure.',
                            p3: '',
                            cta1: cta.cta1,
                            cta2: cta.cta2,
                            hidden: cta.hidden
                        }));
                        componentWriter(component);
                    }
                },

                success: registerViewListener
            }
        ];
    };
});
