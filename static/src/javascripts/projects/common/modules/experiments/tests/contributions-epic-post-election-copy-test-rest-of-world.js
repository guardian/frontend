define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-epic-equal-buttons.html',
    'text!common/views/contributions-epic.html',
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
             contributionsEpic,
             robust,
             arrowRight,
             config,
             cookies,
             embed,
             ajax,
             commercialFeatures,
             intersection
) {


    return function () {

        this.id = 'ContributionsEpicPostElectionCopyTestRestOfWorld';
        this.start = '2016-11-09';
        this.expiry = '2016-11-11';
        this.author = 'Jonathan Rankin';
        this.description = 'Test a version of the epic centered around the election result against one that is not related to the election';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'All readers who are not in the US, who are reading about US politics or the US election, as well as not reading a Brexit articles ';
        this.dataLinkNames = '';
        this.idealOutcome = 'We learn to what extend using messages that chime with current events have an impact on contributor/supporter conversion';
        this.canRun = function () {
            var whitelistedKeywordIds = ['us-news/us-elections-2016', 'us-news/us-politics'];

            var hasKeywordsMatch = function() {
                var pageKeywords = config.page.keywordIds;
                return pageKeywords && intersection(whitelistedKeywordIds, pageKeywords.split(',')).length > 0;
            };

            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate && hasKeywordsMatch();

        };



        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';


        var messages  = {
            controlMessage : '...we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. ' +
            'So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do ' +
            'it because we believe our perspective matters – because it might well be your perspective, too.',
            trumpMessage : '...we have a small favor to ask. As Donald Trump is elected President, never have we needed an independent, progressive media more. Through our reporting, we will hold the new ' +
            'president to account. We will continue to uncover the truth, to sort fact from fiction. When underrepresented voices are stifled, we will elevate them. And we will strive to understand the ' +
            'forces behind his victory, what impact they now have, and view it all in a global context. If everyone who reads our journalism – who believes in it – helps to support it, our future would be more secure.'
        };

        var cta = {
            contributionsMain : {
                p2: 'If everyone who reads our reporting, who likes it, helps to pay for it our future would be more secure. You can give money to the Guardian in less than a minute.',
                p3: 'Alternatively, you can join the Guardian and get even closer to our journalism by ',
                cta1: 'Make a contribution',
                cta2: 'becoming a Supporter.'
            },

            membershipMain : {
                p2: 'If everyone who reads our reporting – who believes in it – helps to support it, our future would be more secure. Get closer to our journalism, be part of our story and join the Guardian.',
                p3: 'Alternatively, you can ',
                cta1: 'Become a supporter',
                cta2: 'make a one-off contribution.'
            },

            equal: {
                p2: 'If everyone who reads our reporting – who believes in it – helps to support it, our future would be more secure. Give to the Guardian by becoming a Supporter or by making a one-off contribution.',
                p3: '',
                cta1: 'Become a supporter',
                cta2: 'Make a contribution'
            }
        };

        var componentWriter = function (component) {
            ajax({
                url: 'https://api.nextgen.guardianapps.co.uk/geolocation',
                method: 'GET',
                contentType: 'application/json',
                crossOrigin: true
            }).then(function (resp) {
                if(resp.country !== 'US') {
                    fastdom.write(function () {
                        var submetaElement = $('.submeta');
                        if(submetaElement.length > 0) {
                            component.insertBefore(submetaElement);
                            embed.init();
                            mediator.emit('contributions-embed:insert', component);
                        }
                    });
                }
            });
        };

        var makeUrl = function(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:insert', complete);
        };

        var contributeUrlPrefix = 'co_row_epic_footer_';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_';

        this.variants = [
            {
                id: 'contributionsControl',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(contributeUrl, contributeUrlPrefix + 'contributions_main_row_3'),
                        linkUrl2: makeUrl(membershipUrl, membershipUrlPrefix + 'contributions_main_row_3'),
                        p1: messages.controlMessage,
                        p2: cta.contributionsMain.p2,
                        p3: cta.contributionsMain.p3,
                        cta1: cta.contributionsMain.cta1,
                        cta2: cta.contributionsMain.cta2,
                        hidden: ''
                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },

            {
                id: 'contributionsElection',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(contributeUrl, contributeUrlPrefix + 'contributions_election_main_row_3'),
                        linkUrl2: makeUrl(membershipUrl, membershipUrlPrefix + 'contributions_election_main_row_3'),
                        p1: messages.trumpMessage,
                        p2: cta.contributionsMain.p2,
                        p3: cta.contributionsMain.p3,
                        cta1: cta.contributionsMain.cta1,
                        cta2: cta.contributionsMain.cta2,
                        hidden: ''
                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },

            {
                id: 'membershipControl',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(membershipUrl, membershipUrlPrefix + 'membership_main_row_3'),
                        linkUrl2: makeUrl(contributeUrl, contributeUrlPrefix + 'membership_main_row_3'),
                        p1: messages.controlMessage,
                        p2: cta.membershipMain.p2,
                        p3: cta.membershipMain.p3,
                        cta1: cta.membershipMain.cta1,
                        cta2: cta.membershipMain.cta2,
                        hidden: ''
                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },

            {
                id: 'membershipElection',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(membershipUrl, membershipUrlPrefix  + 'membership_election_main_row_3'),
                        linkUrl2: makeUrl(contributeUrl, contributeUrlPrefix + ' membership_election_main_row_3'),
                        p1: messages.trumpMessage,
                        p2: cta.membershipMain.p2,
                        p3: cta.membershipMain.p3,
                        cta1: cta.membershipMain.cta1,
                        cta2: cta.membershipMain.cta2,
                        hidden: ''
                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },

            {
                id: 'equalControl',
                test: function () {
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_row_3'),
                        linkUrl2: makeUrl(contributeUrl, contributeUrlPrefix + 'equal_row_3'),
                        p1: messages.controlMessage,
                        p2: cta.equal.p2,
                        cta1: cta.equal.cta1,
                        cta2: cta.equal.cta2,
                        hidden: ''
                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },

            {
                id: 'equalElection',
                test: function () {
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_election_row_3'),
                        linkUrl2: makeUrl(contributeUrl, contributeUrlPrefix + 'equal_election_row_3'),
                        p1: messages.trumpMessage,
                        p2: cta.equal.p2,
                        cta1: cta.equal.cta1,
                        cta2: cta.equal.cta2,
                        hidden: ''
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
