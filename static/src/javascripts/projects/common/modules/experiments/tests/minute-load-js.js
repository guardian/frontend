define([
    'common/utils/config',
    'common/utils/detect'
], function(
    config,
    detect
) {
    return function() {
        this.id = 'MinuteLoadJs';
        this.start = '2016-08-17';
        this.expiry = '2016-09-01';
        this.author = 'Gideon Goldberg';
        this.showForSensitive = true;
        this.description = 'Minutely load JS';
        this.audience = 0.1;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Video starts';
        this.audienceCriteria = 'Users in the minutely test require the JS in landing pages in order for their video teasers to work on fronts';
        this.dataLinkNames = '';
        this.idealOutcome = 'Increase interaction with video trails';
        this.canRun = function() {
            return (config.page.isFront &&  document.getElementsByClassName('fc-item__video').length > 0 || config.page.contentType === 'Article' || config.page.contentType === 'Video') && detect.getBreakpoint() === 'desktop';
        };


        function initMinute() {
            // This is our minute account number
            window._min = {_publisher: 'MIN-21000'};
            require(['js!https://d2d4r7w8.map2.ssl.hwcdn.net/mi-guardian-prod.js']);
        }


        this.variants = [
            {
                id: 'minute',
                test: function () {
                    initMinute();
                }
            },
            {
                id: 'control',
                test: function () {
                }

            }
        ];
    };

});
