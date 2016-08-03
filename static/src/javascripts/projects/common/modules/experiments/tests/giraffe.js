define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/giraffe-message.html',
    'inlineSvg!svgs/icon/arrow-right'
], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             giraffeMessage,
             arrowRight
) {
    return function () {

        this.id = 'GiraffeArticle20160802';
        this.start = '2016-08-02';
        this.expiry = '2016-08-22';
        this.author = 'Mark Butler';
        this.description = 'Add a button allowing readers to contribute money.';
        this.showForSensitive = false;
        this.audience = 0.10;
        this.audienceOffset = 0;
        this.successMeasure = 'Determine the best message for driving contributions.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function () {
            var pageObj = window.guardian.config.page;
            return !(pageObj.isSensitive || pageObj.isLiveBlog || pageObj.isFront || pageObj.isAdvertisementFeature) && pageObj.edition === 'UK';
        };

        var writer = function (linkText, linkHref, copy) {
            var $newThing = $.create(template(giraffeMessage, {
                linkText:linkText,
                linkName: 'contribute',
                linkHref: linkHref,
                copy: copy,
                svg: svg(arrowRight, ['button--giraffe__icon'])
            }));

            return fastdom.write(function () {
                var a = $('.submeta');
                $newThing.insertBefore(a);
                mediator.emit('giraffe:insert');
            });
        };

        var completer = function (complete) {
            mediator.on('giraffe:insert', function () {
                bean.on(qwery('#giraffe-contribute')[0], 'click', function (){
                    complete();
                });
            });
        };

        this.variants = [
            {
                id: 'everyone',
                test: function () {
                    writer('If everyone were to chip in, the Guardian\'s future would be more secure. ', 'https://membership.theguardian.com/contribute?INTCMP=co_uk_inarticle_everyone', 'Please support the Guardian and independent journalism');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'honest',
                test: function () {
                    writer('Be honest. When was the last time you paid for quality news online? ', 'https://membership.theguardian.com/contribute?INTCMP=co_uk_inarticle_honest', 'Please support the Guardian and independent journalism');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'like',
                test: function () {
                    writer('If you use it, if you like it, why not pay for it? It\'s only fair. ', 'https://membership.theguardian.com/contribute?INTCMP=co_uk_inarticle_like', 'Contribute to the Guardian');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'complex',
                test: function () {
                    writer('The world is complex. We\'ll give our all to help you understand it. Will you give something to help us help you? ', 'https://membership.theguardian.com/contribute?INTCMP=co_uk_inarticle_complex', 'Please contribute to the Guardian');
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
