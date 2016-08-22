define([
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/template',
    'common/views/svg',
    'common/utils/fastdom-promise',
    'common/utils/mediator',
    'text!common/views/contributions-embed.html',
    'text!common/views/contributions-header.html',
    'common/views/svgs',
    'common/modules/article/space-filler'
], function (bean,
             qwery,
             $,
             template,
             svg,
             fastdom,
             mediator,
             contributionsEmbed,
             contributionsHeader,
             svgs,
             spaceFiller
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

        var getSpacefinderRules = function () {
            return {
                bodySelector: '.js-article__body',
                slotSelector: ' > p',
                minAbove: 200,
                minBelow: 150,
                clearContentMeta: 50,
                fromBottom: true,
                selectors: {
                    ' .element-rich-link': {minAbove: 100, minBelow: 100},
                    ' > h2': {minAbove: 200, minBelow: 0},
                    ' > *:not(p):not(h2):not(blockquote)': {minAbove: 35, minBelow: 200},
                    ' .ad-slot': {minAbove: 150, minBelow: 200}
                }
            };
        };

        var writer = function () {
            var $embed = $.create(template(contributionsEmbed, {
                linkText : 'give to the Guardian',
                linkHref : 'https://contribute.theguardian.com/uk?INTCMP=co_uk_head_give_coin',
                coinSvg: svgs('contributionsCoin', ['rounded-icon', 'control__icon-wrapper'])
            }));

           return spaceFiller.fillSpace(getSpacefinderRules(), function (paras) {
                    $embed.insertBefore(paras[0]);
                    mediator.emit('contributions-embed:insert');
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
                    writer();
                },
                success: function (complete) {
                    completer(complete);
                }
            }
        ];
    };
});
