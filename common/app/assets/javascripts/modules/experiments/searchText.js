define(['common/$', 'common/utils/detect'], function ($, detect) {

    var HeaderSearchText = function () {

        this.id = 'HeaderSearchText';
        this.start = '2014-05-12';
        this.expiry = '2014-06-09';
        this.author = 'Raul Tudor';
        this.description = 'The header search box will display a label for tablet and desktop.';
        this.audience = 0.5;
        this.audienceOffset = 0;
        this.successMeasure = 'Clicks/taps on the search box.';
        this.audienceCriteria = 'Users who are not on mobile.';
        this.dataLinkNames = 'Search icon';
        this.idealOutcome = 'Increased number of clicks/taps on the search box.';

        this.canRun = function () {
            return detect.getBreakpoint() !== 'mobile';
        };

        this.variants = [
            {
                id: 'control',
                test: function () {
                }
            },
            {
                id: 'hide',
                test: function () {
                    // hide text
                    $('.top-nav__item--search .control__info').css({
                        display: 'none !important'
                    });
                    // make it narrower
                    $('.top-nav__item--search')
                        .removeClass('top-nav__item--search')
                        .addClass('top-nav__item--search__hidden');
                }
            }
        ];
    };

    return HeaderSearchText;

});