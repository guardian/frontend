define([
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'qwery',
    'bean'
], function(
    config,
    detect,
    mediator,
    qwery,
    bean
) {
    return function() {
        this.id = 'Minute';
        this.start = '2016-08-17';
        this.expiry = '2016-09-01';
        this.author = 'Gideon Goldberg';
        this.showForSensitive = true;
        this.description = 'Minutely desktop test';
        this.audience = 0.1;
        this.audienceOffset = 0.8;
        this.successMeasure = 'Video starts';
        this.audienceCriteria = 'Desktop users on fronts containing embedded video';
        this.dataLinkNames = '';
        this.idealOutcome = 'Increase interaction with video trails';
        this.canRun = function() {
            return config.page.isFront &&  document.getElementsByClassName('fc-item__video').length > 0 && detect.getBreakpoint() === 'desktop';
        };


        function initMinute() {
            // This is our minute account number
            window._min = {_publisher: 'MIN-21000'};
            require(['js!https://d2d4r7w8.map2.ssl.hwcdn.net/mi-guardian-prod.js']);
        }

        function success(complete) {
            qwery('.fc-item__video').forEach(function(el) {
                bean.on(el.parentNode, 'click', complete);
            });

        }

        this.variants = [
            {
                id: 'minute',
                test: function () {
                    initMinute();
                },

                success: success
            },
            {
                id: 'control',
                test: function () {
                },

                success: success
            }
        ];
    };

});
