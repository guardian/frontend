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
        var that = this;
        this.$overlay = $('.js-hosted-more-from-overlay');
        this.$seeAllButton = $('.js-hosted-see-all-onward');
        this.$closeButton = $('.js-hosted-more-from-overlay-close');
        this.$container = $('.js-hosted-more-from-popup-container');
        this.$cards = $('.js-hosted-more-from-popup-content');

        if (this.$seeAllButton.length) {
            this.$seeAllButton.each(function(el){
                bean.on(el, 'click', that.openPopup.bind(that));
            });
            this.$closeButton.each(function(el){
                bean.on(el, 'click', that.closePopup.bind(that));
            });

            fastdom.write(function () {
                that.$container[0].appendChild(that.$cards[0]);
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
