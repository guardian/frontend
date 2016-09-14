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
    'common/modules/commercial/commercial-features',
    'common/modules/experiments/embed'
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
             commercialFeatures,
             embed
) {


    return function () {

        this.id = 'ContributionsEpic20160906';
        this.start = '2016-09-06';
        this.expiry = '2016-09-13';
        this.author = 'Jonathan Rankin';
        this.description = 'Test whether contributions embed performs better than our previous in-article component tests.';
        this.showForSensitive = false;
        this.audience = 0.05;
        this.audienceOffset = 0.33;
        this.successMeasure = 'Impressions to number of contributions';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'The embed performs at least as good as our previous in-article component tests';
        this.canRun = function () {
            var worksWellWithPageTemplate = (config.page.contentType === 'Article'); // may render badly on other types
            return commercialFeatures.canAskForAContribution && worksWellWithPageTemplate && !obWidgetIsShown();
        };

        function obWidgetIsShown() {
            var $outbrain = $('.js-outbrain-container');
            return $outbrain && $outbrain.length > 0;
        }

        var bottomWriter = function (component) {

            return fastdom.write(function () {
                var a = $('.submeta');
                component.insertBefore(a);
                embed.init();
                mediator.emit('contributions-embed:insert', component);
            });

        };


        var completer = function (complete) {
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
                    var component = $.create(template(contributionsEpic, {
                        linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_epic',
                        position: 'bottom',
                        variant: 'no-buttons'
                    }));
                    bottomWriter(component);
                },
                success: completer
            }
        ];
    };
});
