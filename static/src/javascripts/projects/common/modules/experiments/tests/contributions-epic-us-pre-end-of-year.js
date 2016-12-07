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
             ElementInview) {

    return function () {
        this.id = 'ContributionsEpicUsPreEndOfYear';
        this.start = '2016-12-06';
        this.expiry = '2016-12-12';
        this.author = 'Guy Dawson';
        this.description = 'Test which Epic variant to use in the US end of year campaign';
        this.showForSensitive = false;
        this.audience = 0.1;
        this.audienceOffset = 0.9;
        this.successMeasure = 'Conversion rate (contributions / impressions)';
        this.audienceCriteria = 'All';
        this.dataLinkNames = '';
        this.idealOutcome = 'We are able to determine which Epic variant to use in the US end of year campaign';
        this.canRun = function () {
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate;
        };

        function makeEvent(name) {
            return this.id + ':' + name;
        }

        function makeUrl(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        }

        var contributeUrlPrefix = 'co_global_epic_us_pre_end_of_year';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_us_pre_end_of_year';

        var epicInsertedEvent = makeEvent('insert');
        var epicViewedEvent = makeEvent('view');

        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';

        var messages  = {
            control: {
                title: 'Since you’re here…',
                p1: '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If everyone who reads our reporting, who likes it, helps to pay for it our future would be much more secure.'
            },
            bolder: {
                title: 'Take a moment…',
                p1: '…to support independent journalism. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. We need your support. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If you read and like our reporting, help us make our future more secure.'
            },
            endOfYear: {
                title: 'As 2016 comes to a close…',
                p1: '…we would like to ask for your support. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why now is the right time to ask. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.',
                p2: 'If everyone who reads our reporting – who believes in it – helps to support it, our future would be more secure.'
            }
        };

        var cta = {
            equal: {
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution',
                url1: makeUrl(membershipUrl, membershipUrlPrefix),
                url2:  makeUrl(contributeUrl, contributeUrlPrefix),
                hidden: ''
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
                            mediator.emit(epicInsertedEvent, component);
                            $('.contributions__epic').each(function (element) {
                                // top offset of 18 ensures view only counts when half of element is on screen
                                var elementInView = ElementInview(element, window, {top: 18});
                                elementInView.on('firstview', function () {
                                    mediator.emit(epicViewedEvent);
                                });

                            });
                        }
                    });
                }
            });
        };

        function registerInsertionListener(track) {
            mediator.on(epicInsertedEvent, track);
        }

        function registerViewListener(complete) {
            mediator.on(epicViewedEvent, complete);
        }

        this.variants = [
            {
                id: 'control',

                test: function () {
                    var ctaType = cta.equal;
                    var message = messages.control;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + '_control',
                        linkUrl2: ctaType.url2 + '_control',
                        title: message.title,
                        p1: message.p1,
                        p2: message.p2,
                        p3: ctaType.p3,
                        cta1: ctaType.cta1,
                        cta2: ctaType.cta2,
                        hidden: ctaType.hidden
                    }));
                    componentWriter(component);
                },

                impression: registerInsertionListener,

                success: registerViewListener
            },
            {
                id: 'bolder',

                test: function () {
                    var ctaType = cta.equal;
                    var message = messages.bolder;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + '_bolder',
                        linkUrl2: ctaType.url2 + '_bolder',
                        title: message.title,
                        p1: message.p1,
                        p2: message.p2,
                        p3: ctaType.p3,
                        cta1: ctaType.cta1,
                        cta2: ctaType.cta2,
                        hidden: ctaType.hidden
                    }));
                    componentWriter(component);
                },

                impression: registerInsertionListener,

                success: registerViewListener
            },
            {
                id: 'endOfYear',

                test: function () {
                    var ctaType = cta.equal;
                    var message = messages.endOfYear;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + '_end_of_year',
                        linkUrl2: ctaType.url2 + '_end_of_year',
                        title: message.title,
                        p1: message.p1,
                        p2: message.p2,
                        p3: ctaType.p3,
                        cta1: ctaType.cta1,
                        cta2: ctaType.cta2,
                        hidden: ctaType.hidden
                    }));
                    componentWriter(component);
                },

                impression: registerInsertionListener,

                success: registerViewListener
            }
        ];
    };
});
