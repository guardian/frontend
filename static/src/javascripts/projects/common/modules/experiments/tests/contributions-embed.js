define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-embed.html',
    'common/utils/robust'

], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsEmbed,
             robust
) {


    return function () {

        this.id = 'ContributionsEmbed20160822';
        this.start = '2016-08-22';
        this.expiry = '2016-08-26';
        this.author = 'Jonathan Rankin';
        this.description = 'Test contributions embed with amount picker.';
        this.showForSensitive = false;
        this.audience = 0.13;
        this.audienceOffset = 0;
        this.successMeasure = 'Determine the effectivness of allowing user to pick contribution amount in the cta';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function () {
            var pageObj = window.guardian.config.page;
            return !(pageObj.isSensitive || pageObj.isLiveBlog || pageObj.isFront || pageObj.isAdvertisementFeature) && pageObj.edition === 'UK';
        };


        var writer = function () {
            var $embed = $.create(template(contributionsEmbed, {
                linkHref : 'https://interactive.guim.co.uk/contributions-embeds/embed/embed.html'
            }));

            return fastdom.write(function () {
                var a = $('.submeta');
                $embed.insertBefore(a);
                mediator.emit('contributions-embed:insert');
            });

        };

        var completer = function (complete) {
            mediator.on('contributions-embed:insert', function () {
                qwery('figure.interactive.contribute-embed').forEach(function (el) {
                    require([el.getAttribute('data-interactive')], function (interactive) {
                        robust.catchErrorsAndLog('interactive-bootstrap', function () {
                            interactive.boot(el, document, window.guardian.config, mediator);
                        });
                    });

                    require(['ophan/ng'], function(ophan) {
                        var a = el.querySelector('a');
                        var href = a && a.href;

                        if (href) {
                            ophan.trackComponentAttention(href, el);
                        }
                    });
                });

                bean.on(qwery('#giraffe__contribute-button')[0], 'click', function (){
                    complete();
                });

            });
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    writer();
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
