define([
    'commercial/modules/user-features',
    'lib/fastdom-promise',
    'lib/$'
], function (userFeatures, fastdom, $) {
    var LAST_CLASS = 'brand-bar__item--split--last';

    function init() {
        if (userFeatures.isPayingMember()) {
            var $becomeMemberLink = $('.js-become-member');
            var $subscriberLink = $('.js-subscribe');
            fastdom.mutate(function () {
                $becomeMemberLink.attr('hidden', 'hidden');
                $subscriberLink.removeClass(LAST_CLASS);
            });
        }
    }

    return init;

});
