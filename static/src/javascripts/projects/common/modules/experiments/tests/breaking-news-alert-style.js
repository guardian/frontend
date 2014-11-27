define([
    'bonzo',
    'qwery'
], function (
    bonzo,
    qwery
) {
    var $el = bonzo(qwery('.js-breaking-news-placeholder'));

    return function () {
        this.id = 'BreakingNewsAlertStyle';
        this.start = '2014-11-26';
        this.expiry = '2015-02-01';
        this.author = 'Alex Sanders';
        this.description = 'Test the efficacy of different alert types for breaking news';
        this.audience = 1;
        this.audienceOffset = 0;
        this.successMeasure = '';
        this.audienceCriteria = 'All users';
        this.dataLinkNames = '';
        this.idealOutcome = '';

        this.canRun = function () {
            return true;
        };

        this.variants = [
            {
                id: 'control',
                test: function () { }
            },
            {
                id: 'top',
                test: function () {
                    $el.addClass('breaking-news--top');
                    bonzo(document.body).prepend(bonzo(bonzo.create($el[0])).addClass('breaking-news--spectre'));
                }
            },
            {
                id: 'bottom',
                test: function () {
                    $el.addClass('breaking-news--bottom');
                    bonzo(document.body).append(bonzo(bonzo.create($el[0])).addClass('breaking-news--spectre'));
                }
            },
            {
                id: 'modal',
                test: function () {
                    $el.addClass('breaking-news--modal');
                }
            },
            {
                id: 'popup',
                test: function () {
                    $el.addClass('breaking-news--popup');
                }
            }
        ];
    };

});
