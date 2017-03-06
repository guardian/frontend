define(['commercial/modules/user-features', 'lib/fastdom-promise', 'Promise', 'lib/$'], function (userFeatures, fastdom, Promise, $) {
    var LAST_CLASS = 'brand-bar__item--split--last';

    function init() {
        if (userFeatures.isPayingMember()) {
            var $becomeMemberLink = $('.js-become-member');
            var $subscriberLink = $('.js-subscribe');
            fastdom.write(function () {
                $becomeMemberLink.attr('hidden', 'hidden');
                $subscriberLink.removeClass(LAST_CLASS);
            });
        }
    }

    return init;

});
