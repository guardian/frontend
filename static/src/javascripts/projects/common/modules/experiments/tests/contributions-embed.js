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
    'text!common/views/giraffe-message.html',
    'inlineSvg!svgs/icon/arrow-right',
    'common/utils/config'

], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsEmbed,
             robust,
             giraffeMessage,
             arrowRight,
             config
) {


    return function () {

        this.id = 'ContributionsEmbed20160823';
        this.start = '2016-08-23';
        this.expiry = '2016-08-30';
        this.author = 'Jonathan Rankin';
        this.description = 'Test contributions embed with amount picker.';
        this.showForSensitive = false;
        this.audience = 0.10;
        this.audienceOffset = 0.13;
        this.successMeasure = 'Impressions to number of contributions';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = 'The interactive embed performs 3x better than the control';
        this.canRun = function () {
            var pageObj = config.page;
            return !(pageObj.isSensitive || pageObj.isLiveBlog || pageObj.isFront || pageObj.isAdvertisementFeature) && pageObj.edition === 'UK';
        };


        var writer = function (component) {

            return fastdom.write(function () {
                var a = $('.submeta');
                component.insertBefore(a);
                mediator.emit('contributions-embed:insert', component);
            });

        };

        var interactiveCompleter = function (complete) {
            mediator.on('contributions-embed:insert', function (el) {
                if (el.length < 1 ) {
                    return;
                }
                var component = el[0];
                require([component.getAttribute('data-interactive')], function (interactive) {
                    robust.catchErrorsAndLog('interactive-bootstrap', function () {
                        interactive.boot(component, document, config, mediator);
                    });
                });

                require(['ophan/ng'], function(ophan) {
                    var a = component.querySelector('a');
                    var href = a && a.href;

                    if (href) {
                        ophan.trackComponentAttention(href, component);
                    }
                });


                bean.on(qwery('#js-giraffe__contribute-button')[0], 'click', function (){
                    complete();
                });

            });
        };

        var controlCompleter = function (complete) {
            mediator.on('giraffe:insert', function () {
                bean.on(qwery('#js-giraffe__contribute')[0], 'click', function (){
                    complete();
                });
            });
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    var component = $.create(template(giraffeMessage, {
                        linkText: 'If you use it, if you like it, why not pay for it? It’s only fair',
                        linkName: 'contribute',
                        linkHref: 'https://contribute.theguardian.com/?INTCMP=co_uk_cobed_like_control',
                        copy: 'Give to the Guardian',
                        svg: svg(arrowRight, ['button--giraffe__icon'])
                    }));
                    writer(component);
                },
                success: controlCompleter
            },

            {
                id: 'interactive',
                test: function () {
                    var component = $.create(template(contributionsEmbed, {
                        linkHref : 'https://interactive.guim.co.uk/contributions-embeds/embed/embed.html'
                    }));
                    writer(component);
                },
                success: interactiveCompleter
            }
        ];
    };
});
