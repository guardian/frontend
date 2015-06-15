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
    /**
     * DO NOT MOVE THIS INSIDE THE `tests` FOLDER
     * ------------------------------------------
     * Rich has written some funky thing that parses the JavaScript in that folder in order to provide an endpoint with
     * test IDs. As we're programmatically generating test IDs here, the parser gets confused, and then provides a test
     * without an ID, which breaks the data team's loader. As this is a temporary thing, let's just not send it to the
     * data team at all to begin with.
     */
    return function (n) {
        this.id = 'Headline' + n;
        this.start = '2015-04-9';
        this.expiry = '2015-07-17';
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
                test: function () {}
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
