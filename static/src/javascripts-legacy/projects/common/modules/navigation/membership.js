define(['commercial/modules/user-features', 'lib/fastdom-promise', 'lib/$'], function (userFeatures, fastdom, $) {
    var LAST_CLASS = 'brand-bar__item--split--last';

    function init() {
        if (userFeatures.isPayingMember()) {
            var $becomeMemberLink = $('.js-become-member');
            var $becomeSupporterLabel = $('.header-cta-item__label');
            var $subscriberLink = $('.js-subscribe');
            fastdom.write(function () {
                $becomeSupporterLabel.html('Thank you for <span class="header-cta-item__new-line">your support</span>');
                $becomeMemberLink.attr('hidden', 'hidden');
                $subscriberLink.removeClass(LAST_CLASS);
            });
        }
    }

    return init;

});
