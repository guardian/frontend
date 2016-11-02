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

        this.id = 'ContributionsMembershipEpic';
        this.start = '2016-11-01';
        this.expiry = '2016-11-04';
        this.author = 'Phil Wills';
        this.description = 'Find the optimal way of offering Contributions along side Membership in the Epic component';
        this.showForSensitive = false;
        this.audience = 0.15;
        this.audienceOffset = 0.5;
        this.successMeasure = 'Impressions to number of contributions/supporter signups';
        this.audienceCriteria = 'All users in US';
        this.dataLinkNames = '';
        this.idealOutcome = 'The messages performs less than 20% differently in different countries';
        this.canRun = function () {
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate;
        };

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
                        component.insertBefore(submetaElement);
                        embed.init();
                        mediator.emit('contributions-embed:insert', component);
                    });
                }
            });
        };

        var makeUrl = function(intcmp) {
            return 'https://contribute.theguardian.com/us?INTCMP=co_us_donatom_footer_' + intcmp + '&amount=50';
        };

        var completer = function (complete) {
            mediator.on('contributions-embed:insert', function () {
                bean.on(qwery('.js-submit-input-contribute')[0], 'click', complete);
            });
        };

        this.variants = [

            {
                id: 'control',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        linkUrl: makeUrl('control')
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
