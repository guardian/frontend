define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
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

        this.id = 'ContributionsMembershipEpicBrexit';
        this.start = '2016-11-04';
        this.expiry = '2016-11-08';
        this.author = 'Jonathan Rankin';
        this.description = 'Find the optimal way of offering Contributions along side Membership in the Epic component on stories about Brexit';
        this.showForSensitive = true;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'All users in US and UK';
        this.dataLinkNames = '';
        this.idealOutcome = 'One of the 2 variants proves to be a clear winner';
        this.canRun = function () {
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            if('keywordIds' in config.page && 'nonKeywordTagIds' in config.page) {
                var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
                var keywords = config.page.keywordIds.split(',');
                var nonKeywordTagIds = config.page.nonKeywordTagIds.split(',');
                var isMinuteArticle = ('isMinuteArticle' in config.page && config.page.isMinuteArticle);
                var isAboutBrexit = (keywords.indexOf('politics/eu-referendum') !== -1) && (nonKeywordTagIds.indexOf('tone/news') !== -1);
                return !isMinuteArticle && isAboutBrexit && userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate;
            } else {
                return false;
            }
        };

        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';

        var componentWriter = function (component) {
            ajax({
                url: 'https://api.nextgen.guardianapps.co.uk/geolocation',
                method: 'GET',
                contentType: 'application/json',
                crossOrigin: true
            }).then(function (resp) {
                if(resp.country === 'GB') {
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
            mediator.on('contributions-embed:insert', complete());
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(contributeUrl, 'co_ukus_epic_footer_contribute-main_brexit'),
                        linkUrl2: makeUrl(membershipUrl, 'gdnwb_copts_mem_epic_membership_alt_brexit'),
                        p1: '... we have a small favour to ask. More people are reading the Guardian than ever. But far fewer are paying for it. And advertising revenues are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters - because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting, who likes it, helps to pay for it our future would be more secure. You can give money to the Guardian in less than a minute.',
                        p3: 'Alternatively, you can join the Guardian and get even closer to our journalism by ',
                        cta1: 'Make a contribution',
                        cta2: 'becoming a Supporter.',
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
                id: 'member-contribute',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(membershipUrl, 'gdnwb_copts_mem_epic_membership_main_brexit'),
                        linkUrl2: makeUrl(contributeUrl, 'co_ukus_epic_footer_contribute-alt_brexit'),
                        p1: '... we have a small favour to ask. More people are reading the Guardian than ever. But far fewer are paying for it. And advertising revenues are falling fast. So you can see why we need to ask for your help. The Guardian\'s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters - because it might well be your perspective, too.',
                        p2: 'If everyone who reads our reporting – who believes in it – helps to support it, our future would be more secure. Get closer to our journalism, be part of our story and join the Guardian.',
                        p3: 'Alternatively, you can ',
                        cta1: 'Become a Supporter',
                        cta2: 'make a one-off contribution.',
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
