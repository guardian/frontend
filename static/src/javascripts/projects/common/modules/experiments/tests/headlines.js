define([
    'common/utils/_',
    'bonzo',
    'fastdom',
    'qwery'
], function (
    _,
    bonzo,
    fastdom,
    qwery
) {
    return function (n) {
        this.id = 'Headline' + n;
        this.start = '2015-04-9';
        this.expiry = '2015-06-10';
        this.author = 'Robert Berry';
        this.description = 'A/B test for headline number ' + n;
        this.audience = 0.01;
        this.audienceOffset = 0.75 + 0.01 * n;
        this.successMeasure = 'Greater page views per visit';
        this.audienceCriteria = '1% of our audience, only on fronts';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
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
                    setHeadlineVariant(0);
                }
            },
            {
                id: 'b',
                test: function () {
                    setHeadlineVariant(1);
                }
            }
        ];
    };
});
