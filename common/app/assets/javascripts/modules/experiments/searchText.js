define(['bonzo'], function (bonzo) {

    var HeaderSearchText = function () {

        this.id = 'HeaderSearchText';
        this.start = '2014-05-12';
        this.expiry = '2014-06-09';
        this.author = 'Raul Tudor';
        this.description = 'The header search box will display a label for tablet and desktop.';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.successMeasure = 'Clicks/taps on the search box.';
        this.audienceCriteria = 'Users who are not on mobile.';
        this.dataLinkNames = 'header search box label';
        this.idealOutcome = 'Increased number of clicks/taps on the search box.';

        this.canRun = function(config) {
            detect.getBreakpoint() !== 'mobile';
        };

        this.variants = [
            {
                id: 'control',
                test: function (context, config) {
                }
            },
            {
                id: 'hide',
                test: function (context, config) {
                    bonzo(context.querySelector('.control--search .control__info')).hide();
                }
            }
        ];
    };

    return HeaderSearchText;

});