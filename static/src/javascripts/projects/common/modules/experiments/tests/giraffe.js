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

        this.id = 'ContributionsArticle20160818';
        this.start = '2016-08-18';
        this.expiry = '2016-08-22';
        this.author = 'Mark Butler';
        this.description = 'Add a button allowing readers to contribute money.';
        this.showForSensitive = false;
        this.audience = 0.13;
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
                id: 'about',
                test: function () {
                    writer('Read all about it, knowing you’re a part of it. ', 'Please give to the Guardian', 'co_uk_inarticle_about');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'pockets',
                test: function () {
                    writer('You don’t need deep pockets to support in depth analysis. ', 'Please give to the Guardian', 'co_uk_inarticle_pockets');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'like',
                test: function () {
                    writer('If you use it, if you like it, why not pay for it? It’s only fair. ', 'Give to the Guardian', 'co_uk_inarticle_like');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'love',
                test: function () {
                    writer('If you read it, if you love it, then why not be a part of it? ', 'Please give to the Guardian', 'co_uk_inarticle_love');
                },
                success: function (complete) {
                    completer(complete);
                }
            },
            {
                id: 'truth',
                test: function () {
                    writer('If you value independence. If you value the truth. ', 'Please give to the Guardian', 'co_uk_inarticle_truth');
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
