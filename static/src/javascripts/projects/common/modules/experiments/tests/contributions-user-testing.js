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

        this.id = 'ContributionsUserTesting20160831';
        this.start = '2016-08-31';
        this.expiry = '2016-09-06';
        this.author = 'Mark Butler';
        this.description = 'In article component to for lab testing event.';
        this.showForSensitive = false;
        this.audience = 0;
        this.audienceOffset = 0;
        this.successMeasure = 'Lab testing of in-article component to understand its effectiveness.';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';
        this.canRun = function () {
            var pageObj = window.guardian.config.page;
            return (pageObj.pageId === 'science/2016/aug/29/russian-radio-telescope-strong-signal-hd164595-seti' && pageObj.edition === 'UK');
        };

        var writer = function (linkText, copy, cmpCode) {
            var $newThing = $.create(template(giraffeMessage, {
                linkText: linkText,
                linkName: 'contribute',
                linkHref: 'https://contribute.theguardian.com?INTCMP=' + cmpCode,
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
                bean.on(qwery('#js-giraffe__contribute')[0], 'click', function (){
                    complete();
                });
            });
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    writer('If you use it, if you like it, why not pay for it? It’s only fair. ', 'Give to the Guardian', 'co_uk_inarticle_like_usertesting');
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
