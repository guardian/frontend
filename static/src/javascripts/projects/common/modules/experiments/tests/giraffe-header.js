define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/giraffe-header.html',
    'inlineSvg!svgs/icon/arrow-right'
], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             giraffeHeader,
             arrowRight
) {
    return function () {

        this.id = 'GiraffeHeader20160802';
        this.start = '2016-08-02';
        this.expiry = '2016-08-22';
        this.author = 'Mark Butler';
        this.description = 'Add a header allowing readers to contribute money.';
        this.showForSensitive = false;
        this.audience = 0.10;
        this.audienceOffset = 0;
        this.successMeasure = 'Determine if header is a good mechanism for driving contributions.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function () {
            var pageObj = window.guardian.config.page;
            return !(pageObj.isSensitive || pageObj.isLiveBlog || pageObj.isAdvertisementFeature) && pageObj.edition === 'UK';
        };

        var writer = function (linkText, linkHref, copy) {
            var $newThing = $.create(template(giraffeHeader, {
                linkText:linkText,
                linkName: 'contribute',
                linkHref: linkHref,
                copy: copy,
                svg: svg(arrowRight, ['button--giraffe__icon'])
            }));

            return fastdom.write(function () {
                var a = $('.brand-bar__item--register');
                $newThing.insertBefore(a);
                mediator.emit('giraffe-header:replace');
            });
        };

        var completer = function (complete) {
            mediator.on('giraffe-header:replace', function () {
           //     bean.on(qwery('#giraffe-contribute')[0], 'click', function (){
                    complete();
            //    });
            });
        };

        this.variants = [
            {
                id: 'control',
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
