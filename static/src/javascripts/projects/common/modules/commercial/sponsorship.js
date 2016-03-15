define([
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'lodash/utilities/identity'
], function (
    detect,
    fastdom,
    identity
) {
    function getSponsorshipContainers() {
        var sponsorshipIds = [
            'dfp-ad--adbadge', 'dfp-ad--spbadge', 'dfp-ad--fobadge',
            'dfp-ad--adbadge1', 'dfp-ad--spbadge1', 'dfp-ad--fobadge1',
            'dfp-ad--adbadge2', 'dfp-ad--spbadge2', 'dfp-ad--fobadge2',
            'dfp-ad--adbadge3', 'dfp-ad--spbadge3', 'dfp-ad--fobadge3',
            'dfp-ad--adbadge4', 'dfp-ad--spbadge4', 'dfp-ad--fobadge4',
            'dfp-ad--adbadge5', 'dfp-ad--spbadge5', 'dfp-ad--fobadge5'
        ];
        var boundById = document.getElementById.bind(document);
        return sponsorshipIds.map(boundById).filter(identity);
    }

    function init() {
        if (!detect.adblockInUseSync()) {
            return;
        }

        var sponsorshipContainers = getSponsorshipContainers();
        if (!sponsorshipContainers.length) {
            return;
        }

        var sponsorshipBadges = sponsorshipContainers.map(function (container) {
            var badge = container.cloneNode(true);
            badge.className = badge.className.replace('ad-slot ', '');
            return badge;
        });

        return fastdom.write(function () {
            return sponsorshipBadges.forEach(function (badge, index) {
                var container = sponsorshipContainers[index];
                if (container.previousElementSibling) {
                    container.previousElementSibling.appendChild(badge);
                } else {
                    container.parentNode.insertBefore(badge, container.parentNode.firstChild);
                }
            });
        });
    }

    return {
        init: init
    };
});
