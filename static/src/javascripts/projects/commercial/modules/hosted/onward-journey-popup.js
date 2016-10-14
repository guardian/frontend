define([
    'bean',
    'fastdom',
    'Promise',
    'common/utils/$'
], function (
    bean,
    fastdom,
    Promise,
    $
) {

    function HostedOnwardJourneyPopup() {

    }

    HostedOnwardJourneyPopup.prototype.openPopup = function() {
        var that = this;

        fastdom.write(function () {
            that.$overlay.removeClass('u-h');
        });
    };

    HostedOnwardJourneyPopup.prototype.closePopup = function() {
        var that = this;

        fastdom.write(function () {
            that.$overlay.addClass('u-h');
        });
    };

    HostedOnwardJourneyPopup.prototype.bindButtons = function() {
        this.$overlay = $('.js-hosted-more-from-overlay');
        this.$seeAllButton = $('.js-hosted-see-all-onward');
        this.$closeButton = $('.js-hosted-more-from-overlay-close');

        if (this.$seeAllButton.length) {
            var that = this;
            this.$seeAllButton.each(function(el){
                bean.on(el, 'click', that.openPopup.bind(that));
            });
            this.$closeButton.each(function(el){
                bean.on(el, 'click', that.closePopup.bind(that));
            });
        }

    };

    function init() {
        return new Promise(function(resolve) {
            new HostedOnwardJourneyPopup().bindButtons();
            resolve();
        });
    }

    return {
        init: init,
        HostedOnwardJourneyPopup: HostedOnwardJourneyPopup
    };
});
