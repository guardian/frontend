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

        this.id = 'ContributionsEpic20160916';
        this.start = '2016-09-16';
        this.expiry = '2016-09-27';
        this.author = 'Mark Butler';
        this.description = 'Test variants of the button text to drive contributions.';
        this.showForSensitive = false;
        this.audience = 0.05;
        this.audienceOffset = 0.23;
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
                        id: 'control',
                        linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_epic_cta_control',
                        linkName: 'Contribute',
                        position: 'bottom',
                        variant: 'no-buttons'
                    }));
                    bottomWriter(component);
                },
                success: completer
            },
            {
                id: 'give',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        id: 'give',
                        linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_epic_cta_give',
                        linkName: 'Give today',
                        position: 'bottom',
                        variant: 'no-buttons'
                    }));
                    bottomWriter(component);
                },
                success: completer
            },
            {
                id: 'today',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        id: 'today',
                        linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_epic_cta_today',
                        linkName: 'Contribute today',
                        position: 'bottom',
                        variant: 'no-buttons'
                    }));
                    bottomWriter(component);
                },
                success: completer
            },
            {
                id: 'make',
                test: function () {
                    var component = $.create(template(contributionsEpic, {
                        id: 'make',
                        linkUrl : 'https://contribute.theguardian.com?INTCMP=co_uk_epic_cta_make',
                        linkName: 'Make a contribution',
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
