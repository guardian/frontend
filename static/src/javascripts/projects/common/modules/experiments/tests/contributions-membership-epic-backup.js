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
             intersection) {


    return function () {

        this.id = 'ContributionsMembershipEpicBackup';
        this.start = '2016-11-08';
        this.expiry = '2016-11-11';
        this.author = 'Jonathan Rankin';
        this.description = 'Back up contributions-only epic in case membership goes down';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'All readers reading about US politics/election';
        this.dataLinkNames = '';
        this.idealOutcome = 'If membership goes down, we have a backup way of asking for support from our readers';
        this.canRun = function () {
            var whitelistedKeywordIds = ['us-news/us-elections-2016', 'us-news/us-politics'];
            var pageKeywords = config.page.keywordIds;
            var hasKeywordsMatch = pageKeywords && intersection(whitelistedKeywordIds, pageKeywords.split(',')).length > 0;
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article') && !config.page.isMinuteArticle; // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate && hasKeywordsMatch;
        };

        var contributeUrl = 'https://contribute.theguardian.com/?';


        var message  = {
            control:  '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.'
        };

        var cta = {
            equal: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution'
            }
        };

        var componentWriter = function (component) {
            fastdom.write(function () {
                var submetaElement = $('.submeta');
                if(submetaElement.length > 0) {
                    component.insertBefore(submetaElement);
                    embed.init();
                    mediator.emit('contributions-embed:insert', component);
                }
            });
                
        };

        var makeUrl = function(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:insert', complete);
        };

        var contributeUrlPrefix = 'co_us_epic_footer_';

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl1: makeUrl(contributeUrl, contributeUrlPrefix + 'm1_contributions_main_backup'),
                        linkUrl2: '',
                        p1: message.control,
                        p2: cta.equal.p2,
                        p3: '',
                        cta1: cta.equal.cta1,
                        cta2: '',
                        hidden: 'hidden'
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
