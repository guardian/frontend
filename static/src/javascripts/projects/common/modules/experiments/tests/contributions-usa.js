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
    'common/modules/experiments/embed',
    'common/utils/ajax',
    'common/modules/commercial/commercial-features',
    'common/utils/element-inview'

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
             embed,
             ajax,
             commercialFeatures,
             ElementInview
) {


    return function () {

        this.id = 'ContributionsUsa';
        this.start = '2016-09-23';
        this.expiry = '2016-10-27';
        this.author = 'Jonathan Rankin';
        this.description = 'Test whether contributions embed performs better inline and in-article than at the bottom of the article.';
        this.showForSensitive = false;
        this.audience = 0.60;
        this.audienceOffset = 0.10;
        this.successMeasure = 'Impressions to number of contributions';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'The embed performs 20% better inline and in-article than it does at the bottom of the article';
        this.canRun = function () {
            var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
            return commercialFeatures.canAskForAContribution && worksWellWithPageTemplate
        };

        var bottomWriter = function (component) {
            return fastdom.write(function () {
                try {
                    ajax({
                        url: 'http://api.nextgen.guardianapps.co.uk/geolocation',
                        method: 'GET',
                        contentType: 'application/json',
                        crossOrigin: true
                    }).then(function (resp) {
                        if(resp.country == 'GB') {
                            var submetaElement = $('.submeta');
                            component.insertBefore(submetaElement);
                            embed.init();
                            mediator.emit('contributions-embed:insert', component);
                        }
                    });
                } catch (e) {
                    //Do nothing
                }

            });
        };

        function addInviewLIstener(track) {
            mediator.on('contributions-embed:insert', function () {
                alert("hello");
                $('.contributions__contribute').each(function (el) {
                    //top offset of 18 ensures view only counts when half of element is on screen
                    var elementInview = ElementInview(el, window, {top: 18});
                    elementInview.on('firstview', function () {
                        track();
                    });
                });

            });
        }


        var completer = function (complete) {
            console.log("completer");
            mediator.on('contributions-embed:insert', function () {
                bean.on(qwery('.js-submit-input')[0], 'click', function (){
                    complete();
                });
            });
        };

        this.variants = [

            {
                id: 'control',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        position : 'inline',
                        variant: 'bottom',
                        linkUrl: 'https://contribute.theguardian.com/us?INTCMP=co_usa_donatom&amount=50',
                        currency: '$'

                    }));
                    bottomWriter(component);
                },
                impression: function(track) {
                    console.log("impression");
                    mediator.on('contributions-embed:insert', function() {
                       addInviewLIstener(track);
                   });
                },
                success: completer
            }
        ];
    };
});
