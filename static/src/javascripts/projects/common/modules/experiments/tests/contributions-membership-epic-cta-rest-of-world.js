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
    'common/modules/commercial/commercial-features'

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
             commercialFeatures
) {


    return function () {

        this.id = 'ContributionsMembershipEpicCtaRestOfWorldTwo';
        this.start = '2016-11-08';
        this.expiry = '2016-11-11';
        this.author = 'Jonathan Rankin';
        this.description = 'Find optimal way to present contributions and membership asks in Epic component';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'All readers who are not the US, who are reading about US politics OR the US election, as well as not reading a Brexit articles ';
        this.dataLinkNames = '';
        this.idealOutcome = 'We learn the best way to present contributions and membership asks in Epic component';
        this.canRun = function () {
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            if('keywordIds' in config.page && 'nonKeywordTagIds' in config.page) {
                var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
                var keywords = config.page.keywordIds.split(',');
                var nonKeywordTagIds = config.page.nonKeywordTagIds.split(',');
                var isAboutBrexit = (keywords.indexOf('politics/eu-referendum') !== -1) && (nonKeywordTagIds.indexOf('tone/news') !== -1);
                var isMinuteArticle = ('isMinuteArticle' in config.page && config.page.isMinuteArticle);
                var isAboutUsElectionOrUsPolitics = (keywords.indexOf('us-news/us-elections-2016') !== -1) || (nonKeywordTagIds.indexOf('us-news/us-politics') !== -1);
                return !isMinuteArticle && !isAboutBrexit && isAboutUsElectionOrUsPolitics && userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate;
            } else {
                return false;
            }

        };

        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';


        var message = '...we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. ' +
            'So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do ' +
            'it because we believe our perspective matters – because it might well be your perspective, too.';
        
        
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
                id: 'control',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(contributeUrl, contributeUrlPrefix + 'm1_contributions_main_row_2'),
                        linkUrl2: makeUrl(membershipUrl, membershipUrlPrefix + 'm1_contributions_main_row_2'),
                        p1: message,
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
                id: 'membership',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(membershipUrl, membershipUrlPrefix  + 'm1_membership_main_row_2'),
                        linkUrl2: makeUrl(contributeUrl, contributeUrlPrefix + 'm1_membership_main_row_2'),
                        p1: message,
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
                id: 'equal',
                test: function () {
                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: makeUrl(membershipUrl, membershipUrlPrefix + 'm1_equal_row_2'),
                        linkUrl2: makeUrl(contributeUrl, contributeUrlPrefix + 'm1_equal_row_2'),
                        p1: message,
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
