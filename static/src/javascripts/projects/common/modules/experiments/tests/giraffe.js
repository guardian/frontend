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

        this.id = 'ContributionsArticle20160810';
        this.start = '2016-08-10';
        this.expiry = '2016-08-16';
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
                bean.on(qwery('#giraffe-contribute')[0], 'click', function (){
                    complete();
                });
            });
        };

        this.variants = [
            {
                id: 'always',
                test: function () {
                    writer('You\'re always reading it. So make sure it\'s always here. It\'s only fair. ', 'Give to the Guardian', 'co_uk_inarticle_always');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'can',
                test: function () {
                    writer('There are some things you should do just because you can. Give to the Guardian. It\'s only fair.', '', 'co_uk_inarticle_can');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'like',
                test: function () {
                    writer('If you use it, if you like it, why not pay for it? It\'s only fair. ', 'Give to the Guardian', 'co_uk_inarticle_like');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'backing',
                test: function () {
                    writer('Some things are worth backing, like your principles. ', 'Give to the Guardian', 'co_uk_inarticle_backing');
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
