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
             robust,
             arrowRight,
             config,
             cookies,
             embed,
             ajax,
             commercialFeatures,
             intersection) {

    return function () {

        this.id = 'ContributionsEpicPostElectionCopyTest';
        this.start = '2016-11-09';
        this.expiry = '2016-11-14';
        this.author = 'Sam Desborough';
        this.description = 'Test a version of the epic centered around the election result against one that is not related to the election';
        this.showForSensitive = false;
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'All readers who are in the US, who are reading about US politics or the US election';
        this.dataLinkNames = '';
        this.idealOutcome = 'We learn to what extend using messages that chime with current events have an impact on contributor/supporter conversion';
        this.canRun = function () {
            var includedKeywordIds = [
                'australia-news/australia-news',
                'politics/politics',
                'politics/eu-referendum',
                'society/society',
                'uk/commentisfree',
                'uk/media',
                'uk/uk',
                'us/commentisfree',
                'us/environment',
                'us-news/us-news',
                'us-news/us-politics',
                'us-news/us-elections-2016',
                'us/business',
                'world/world'
            ];

            var excludedKeywordIds = ['music/leonard-cohen'];

            var hasKeywordsMatch = function() {
                var pageKeywords = config.page.keywordIds;
                if (typeof(pageKeywords) != 'undefined') {
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

        var contributeUrlPrefix = 'co_global_epic_';
        var membershipUrlPrefix = 'gdnwb_copts_mem_epic_post_';


        var makeUrl = function(urlPrefix, intcmp) {
            return urlPrefix + 'INTCMP=' + intcmp;
        };

        var membershipUrl = 'https://membership.theguardian.com/supporter?';
        var contributeUrl = 'https://contribute.theguardian.com/?';

        var messages  = {
            control:  '…we have a small favour to ask. More people are reading the Guardian than ever but far fewer are paying for it. And advertising revenues across the media are falling fast. So you can see why we need to ask for your help. The Guardian’s independent, investigative journalism takes a lot of time, money and hard work to produce. But we do it because we believe our perspective matters – because it might well be your perspective, too.'
        };

        var cta = {
            equal: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: 'Make a contribution',
                intcmp1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_postelection_1c'),
                intcmp2:  makeUrl(contributeUrl, contributeUrlPrefix + 'equal_postelection_1c'),
                hidden: ''
            },

            justContribute: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Make a contribution',
                cta2: '',
                intcmp1:  makeUrl(contributeUrl, contributeUrlPrefix + 'equal_postelection_1c_backup'),
                intcmp2: '',
                hidden: 'hidden'
            },

            justSupporter: {
                p2: 'Fund our journalism and together we can keep the world informed.',
                p3: '',
                cta1: 'Become a Supporter',
                cta2: '',
                intcmp1: makeUrl(membershipUrl, membershipUrlPrefix + 'equal_postelection_1c_backup'),
                intcmp2: '',
                hidden: 'hidden'
            }


        };

        var componentWriter = function (component) {
            fastdom.write(function () {
                var submetaElement = $('.submeta');

                if (submetaElement.length > 0) {
                    component.insertBefore(submetaElement);
                    embed.init();
                    mediator.emit('contributions-embed:insert', component);
                }
            });
        };



        var completer = function (complete) {
            mediator.on('contributions-embed:insert', complete);
        };


        this.variants = [
            {
                id: 'control',

                test: function () {
                    var epicType = cta.equal;
                    if(config.switches.turnOffSupporterEpic){
                        epicType = cta.justContribute;
                    }
                    if(config.switches.turnOffContributionsEpic){
                        epicType = cta.justSupporter;
                    }

                    var component = $.create(template(contributionsEpicEqualButtons, {
                        linkUrl1: epicType.intcmp1,
                        linkUrl2: epicType.intcmp2,
                        p1: messages.control,
                        p2:epicType.p2,
                        p3: epicType.p3,
                        cta1: epicType.cta1,
                        cta2: epicType.cta2,
                        hidden: epicType.hidden
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
