define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-embed.html',
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
             contributionsEmbed,
             robust,
             arrowRight,
             config,
             cookies,
             embed,
             ajax,
             commercialFeatures
) {


    return function () {

        this.id = 'ContributionsCountriesUk';
        this.start = '2016-10-28';
        this.expiry = '2016-11-04';
        this.author = 'Phil Wills';
        this.description = 'Test whether different messages perform better/worse in different countries (UK)';
        this.showForSensitive = false;
        this.audience = 0.15;
        this.audienceOffset = 0.56;
        this.successMeasure = 'Impressions to number of contributions';
        this.audienceCriteria = 'All users in UK';
        this.dataLinkNames = '';
        this.idealOutcome = 'The messages performs less than 20% differently in different countries';
        this.canRun = function () {
            var userHasNeverContributed = !cookies.get('gu.contributions.contrib-timestamp');
            var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
            return userHasNeverContributed && commercialFeatures.canReasonablyAskForMoney && worksWellWithPageTemplate;
        };

        var componentWriter = function (component) {
            ajax({
                url: config.page.ajaxUrl + '/geolocation',
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
            return 'https://contribute.theguardian.com/uk?INTCMP=co_uk_donatom_footer_' + intcmp + '&amount=50';
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
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'If you use it, if you like it, then why not pay for it? It’s only fair.',
                        linkUrl: makeUrl('control2'),
                        currency: '£'

                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },
            {
                id: 'global',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'Reporting from a global perspective is vital. But it’s also expensive. Please give to the Guardian today. ',
                        linkUrl: makeUrl('global'),
                        currency: '£'

                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert',track);
                },
                success: completer
            },

            {
                id: 'democracy',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'An independent press and a working democracy. You can’t have one without the other. Please give to the Guardian today.',
                        linkUrl: makeUrl('democracy'),
                        currency: '£'

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
