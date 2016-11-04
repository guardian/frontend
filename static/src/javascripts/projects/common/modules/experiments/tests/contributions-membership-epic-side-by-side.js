define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-membership-epic.html',
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

        this.id = 'ContributionsMembershipEpicSideBySide';
        this.start = '2016-11-04';
        this.expiry = '2016-11-07';
        this.author = 'Jonathan Rankin';
        this.description = 'Find out if offering membership and contributions side by side with equal weighting is as effective as just offering membership by itself';
        this.showForSensitive = true;
        this.audience = 0;
        this.audienceOffset = 0.1;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'All users in US and UK who are not reading articles about Brexit';
        this.dataLinkNames = '';
        this.idealOutcome = 'One of the 2 variants proves to be a clear winner';
        this.canRun = function () {
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
            var keywords = config.page.keywordIds.split(',');
            var nonKeywordTagIds = config.page.nonKeywordTagIds.split(',');
            var isNotAboutBrexit = (keywords.indexOf('politics/eu-referendum') == -1) && (nonKeywordTagIds.indexOf('tone/news') == -1);
            return isNotAboutBrexit && userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate;
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
                if(resp.country === 'GB' || resp.country === 'US') {
                    fastdom.write(function () {
                        var submetaElement = $('.submeta');
                        component.insertBefore(submetaElement);
                        embed.init();
                        mediator.emit('contributions-embed:insert', component);
                    });
                }
            });
        };

        var makeUrl = function(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:insert', function () {
                complete();
            });
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(membershipUrl, 'gdnwb_copts_mem_epic_just_membership'),
                        linkUrl2: '',
                        p2: 'If everyone who reads our reporting – who believes in it – helps to support it, our future would be more secure. Get closer to our journalism, be part of our story and join the Guardian.',
                        cta1: 'Become a Supporter',
                        cta2: '',
                        cta1Class: 'js-submit-input-contribute',
                        cta2Class: '',
                        hidden: 'hidden'
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
                        linkUrl1: makeUrl(membershipUrl, 'gdnwb_copts_mem_epic_cont_mem_equal'),
                        linkUrl2: makeUrl(contributeUrl, 'co_ukus_epic_footer_contribute-alt_brexit'),
                        p2: 'If everyone who reads our reporting – who believes in it – helps to support it, our future would be more secure. Give to the Guardian by becoming a Supporter or by making a one-off contribution.',
                        cta1: 'Become a Supporter',
                        cta2: 'make a one-off contribution.',
                        cta1Class: 'js-submit-input-membership',
                        cta2Class: 'js-submit-input-contribute',
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
