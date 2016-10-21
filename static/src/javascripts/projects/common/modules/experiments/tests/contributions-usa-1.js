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

        this.id = 'ContributionsUsa1';
        this.start = '2016-10-20';
        this.expiry = '2016-10-27';
        this.author = 'Jonathan Rankin';
        this.description = 'Test which of our 5 initial US targeted messages results in the most contributions';
        this.showForSensitive = false;
        this.audience = 0.25;
        this.audienceOffset = 0;
        this.successMeasure = 'Impressions to number of contributions';
        this.audienceCriteria = 'All users with a US IP address';
        this.dataLinkNames = '';
        this.idealOutcome = 'The best message performs at least 70% better than the worst message';
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
                if(resp.country === 'US') {
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
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'If you use it, if you like it, then why not pay for it? It’s only fair.',
                        linkUrl: makeUrl('control'),
                        currency: '$'

                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },
            {
                id: 'vital',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'We believe our global perspective is vital when reporting on world events. If you agree, why not support us?',
                        linkUrl: makeUrl('vital'),
                        currency: '$'

                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert',track);
                },
                success: completer
            },

            {
                id: 'fresh',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'We believe our global perspective gives a fresh insight into US events. If you agree, why not support us?',
                        linkUrl: makeUrl('fresh'),
                        currency: '$'

                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },

            {
                id: 'chips',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'If everyone chipped in, the Guardian’s future would be more secure.',
                        linkUrl: makeUrl('chips'),
                        currency: '$'

                    }));
                    componentWriter(component);
                },
                impression: function(track) {
                    mediator.on('contributions-embed:insert', track);
                },
                success: completer
            },

            {
                id: 'independent',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        titleCopy: 'No billionaire owner, no shareholders. Just independent, investigative reporting that fights for the truth, whatever the cost. Why not support it?',
                        linkUrl: makeUrl('independent'),
                        currency: '$'

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
