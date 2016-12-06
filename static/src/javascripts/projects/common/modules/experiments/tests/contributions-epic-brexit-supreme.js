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

        this.id = 'ContributionsEpicBrexitSupreme';
        this.start = '2016-12-02';
        this.expiry = '2016-12-12';
        this.author = 'Phil Wills';
        this.description = 'Appeal linked to the Brexit appeal in the Supreme Court';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'N/A';
        this.audienceCriteria = 'All';
        this.dataLinkNames = '';
        this.idealOutcome = 'We receive contributions and membership sign-ups';
        this.canRun = function () {

            var includedKeywordIds = ['politics/eu-referendum'];

            var includedSeriesIds = [];

            var excludedKeywordIds = [];

            var excludedSeriesIds = ['theobserver/series/the-observer-at-225'];

            var tagsMatch = function() {
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

        var contributeUrlPrefix = 'co_global_epic_brexit_supreme';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_brexit_supreme';


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
                url1: makeUrl(membershipUrl, membershipUrlPrefix ),
                url2:  makeUrl(contributeUrl, contributeUrlPrefix ),
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
                id: 'mixed',

                test: function () {
                    var ctaType = cta.equal;
                    var message = messages.control;
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: ctaType.url1 + '_mixed',
                        linkUrl2: ctaType.url2 + '_mixed',
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
