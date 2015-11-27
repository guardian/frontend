define([
    'common/utils/$',
    'common/utils/mediator'
], function (
    $,
    mediator
) {
    var articleHeight;

    return {
        init: function () {
            // Check if progress bar is present
            if ($('.progress').length) {
                this.getArticleHeight();
                this.bindEvents();
            }
        },

        bindEvents: function () {
            mediator.on('window:throttledScroll', this.updateProgress.bind(this));
            mediator.on('window:resize', this.getArticleHeight.bind(this));
        },

        updateProgress: function () {
            $('.progress__indicator').css('width', this.getProgressAsPercentage);
        },

        getProgressAsPercentage: function () {
            return window.scrollY / articleHeight * 100 + '%';
        },

        getArticleHeight: function () {
            articleHeight = $('.content--article').offset().height;
        }
    };
});
