define([
    'common/utils/_',
    'bonzo',
    'fastdom',
    'qwery',
    'common/utils/config'
], function (
    _,
    bonzo,
    fastdom,
    qwery,
    config
) {
    return function (n) {
        this.id = 'HeadlineAB' + n;
        this.start = '2015-04-10';
        this.expiry = '2015-06-10';
        this.author = 'Robert Berry';
        this.description = 'AB test for headlines number ' + n;
        this.audience = 0.01;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = '1% of our audience, only on fronts';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return config.page.isFront;
        };

        function setHeadlineVariant(i) {
            _.forEach(qwery('.js-a-b-headline-' + n), function (el) {
                var $el = bonzo(el),
                    headlineEls = qwery('.js-headline-text', el),
                    variantHeadline = JSON.parse($el.attr('data-headline-variants'))[i];

                fastdom.write(function () {
                    _.forEach(headlineEls, function (headlineEl) {
                        bonzo(headlineEl).html(variantHeadline);
                    });
                });
            });
        }

        this.variants = [
            {
                id: 'a',
                test: function () {
                    setHeadlineVariant(1);
                }
            },
            {
                id: 'b',
                test: function () {
                    setHeadlineVariant(0);
                }
            }
        ];
    };
});
