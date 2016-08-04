define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svgs',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-header.html'
], function (bean,
             qwery,
             $,
             template,
             svgs,
             fastdom,
             mediator,
             contributionsHeader
) {
    return function () {

        this.id = 'ContributionsHeader20160802';
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
            return !(pageObj.isLiveBlog || pageObj.isAdvertisementFeature) && pageObj.edition === 'UK';
        };

        var writer = function (linkText, linkHref) {
            var $newThing = $.create(template(contributionsHeader, {
                linkText : linkText,
                linkHref : linkHref,
                coinSvg: svgs('contributionsCoin', ['rounded-icon', 'control__icon-wrapper'])
            }));

            return fastdom.write(function () {
                var a = $('.brand-bar__item--register');
                a.replaceWith($newThing);
                mediator.emit('contributions-Header:insert');
            });
        };

        var completer = function (complete) {
            mediator.on('contributions-header:insert', function () {
                bean.on(qwery('#contributions__header-contribute-link')[0], 'click', complete);
            });
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                    writer('give to the Guardian', 'https://contribute.theguardian.com/uk?INTCMP=co_uk_head_give_coin');
                },
                success: completer
            }
        ];
    };
});
