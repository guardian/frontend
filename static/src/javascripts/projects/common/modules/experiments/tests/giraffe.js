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

        this.id = 'GiraffeArticle20160719';
        this.start = '2016-07-18';
        this.expiry = '2016-08-01';
        this.author = 'Alex Ware';
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
                    writer('If everyone were to chip in, the Guardian\'s future would be more secure. ', 'https://membership.theguardian.com/contribute?INTCMP=article-1-everyone', 'Please support the Guardian and independent journalism');
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
