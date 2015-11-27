define([
    'common/utils/$',
    'common/utils/mediator'
], function (
    $,
    mediator
) {
    return {
        init: function () {
            this.bindEvents();
        },

        bindEvents: function () {
            mediator.on('window:throttledScroll', this.updateProgress.bind(this));
        },

        updateProgress: function () {
            $('.progress__indicator').css('width', this.getProgressAsPercentage);
        },

        getProgressAsPercentage: function () {
            return window.scrollY + "px"
        }
    };
});
