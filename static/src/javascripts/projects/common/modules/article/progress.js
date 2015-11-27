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
            console.log("progress");
        },

        bindEvents: function () {
            mediator.on('window:throttledScroll', this.updateProgress);
        },

        updateProgress: function () {
            console.log("hey");
        }
    };
});
