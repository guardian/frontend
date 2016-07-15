define([
    'Promise',
    'fastdom',
    'common/utils/detect'
], function (Promise, fastdom, detect) {
    return {
        init: init
    };

    function init() {
        var sponsorshipContainers = getSponsorshipContainers();

        if (detect.adblockInUseSync() && sponsorshipContainers.length) {
            return fastdom.write(function () {
                sponsorshipContainers.forEach(function (container) {
                    var sponsorshipClasses = container.className.replace('ad-slot ', '');
                    var sponsorshipBadge = '<div class="' + sponsorshipClasses + '">' + container.innerHTML + '</div>';
                    container.insertAdjacentHTML('beforebegin', sponsorshipBadge);
                });
            });
        } else {
            return Promise.resolve();
        }
    }

    function getSponsorshipContainers() {
        return [
            'dfp-ad--adbadge',  'dfp-ad--spbadge',  'dfp-ad--fobadge',
            'dfp-ad--adbadge1', 'dfp-ad--spbadge1', 'dfp-ad--fobadge1',
            'dfp-ad--adbadge2', 'dfp-ad--spbadge2', 'dfp-ad--fobadge2',
            'dfp-ad--adbadge3', 'dfp-ad--spbadge3', 'dfp-ad--fobadge3',
            'dfp-ad--adbadge4', 'dfp-ad--spbadge4', 'dfp-ad--fobadge4',
            'dfp-ad--adbadge5', 'dfp-ad--spbadge5', 'dfp-ad--fobadge5'
        ]   .map(document.getElementById.bind(document))
            .filter(Boolean);
    }
});
