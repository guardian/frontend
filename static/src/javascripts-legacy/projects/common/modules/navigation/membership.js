define(['commercial/modules/user-features', 'lib/fastdom-promise', 'lib/$'], function (userFeatures, fastdom, $) {
    var LAST_CLASS = 'brand-bar__item--split--last';

    function init() {
        if (userFeatures.isPayingMember()) {
            var $becomeMemberLink = $('.js-become-member');
            var $becomeSupporterLabel = $('.header-cta-item__label');
            var $becomeSupporterNewLine = $('.header-cta-item__new-line');
            var $subscriberLink = $('.js-subscribe');
            fastdom.write(function () {
                $becomeSupporterLabel.text('Thank you for')
                $becomeSupporterNewLine.text('your support')
                $becomeMemberLink.attr('hidden', 'hidden');
                $subscriberLink.removeClass(LAST_CLASS);
            });
        }
    }

    return init;

});
