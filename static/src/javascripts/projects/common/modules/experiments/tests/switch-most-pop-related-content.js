define([
    'common/utils/$'
], function (
    $
) {
    return function () {
        this.id = 'MostPopRelContPosition';
        this.start = '2015-10-15';
        this.expiry = '2015-11-15';
        this.author = 'Josh Holder';
        this.description = 'Switches the location of the most popular and related content containers';
        this.audience = 0.025;
        this.audienceOffset = 0;
        this.successMeasure = 'The number of onward journeys increases';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = 'onward-ab1, popular-ab1';
        this.idealOutcome = '';

        this.canRun = function () {
            return window.guardian.config.page.contentType === 'Article';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {

                }
            },
            {
                id: 'switched',
                test: function () {
                    var $mostPop = $('.js-most-popular-footer'),
                        $onwardEl = $('.related'),
                        markOnwardPos = $onwardEl.next(),
                        markMostPopularPos = $mostPop.next();

                    $mostPop.insertBefore(markOnwardPos);
                    $mostPop.attr('data-link-name', $mostPop.attr('data-link-name') + ' most-popular-ab1');

                    $onwardEl.insertBefore(markMostPopularPos);
                    $onwardEl.attr('data-link-name', 'onward-ab1');
                }
            }
        ];
    };
});
