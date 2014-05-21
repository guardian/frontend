define([
    'common/utils/storage',
    'common/modules/userPrefs',
    'common/modules/onward/history',
    'common/modules/ui/message'
], function(
    storage,
    userPrefs,
    History,
    Message
){

    /**
     * Rules:
     *
     * 4 visits within the last month
     * 3 impressions
     * Persist close state
     */

    var IMPRESSION_KEY = 'gu.ads.appOnboardCount',
        isAndroid = false,
        isIOS = false,
        template = '<h3>The Guardian app</h3><p>Instant alerts.<br/>Offline reading.<br/>Tailored to you.</p>' +
            '<p><strong>FREE</strong> – on the App Store</p></div>';

    function isDevice() {
        isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
        isAndroid = /Android/i.test(navigator.userAgent);
        //return (isIOS || isAndroid);
        return true;
    }

    function canShow() {
        var visits = new History().getSize(),
            impressions = storage.local.get(IMPRESSION_KEY) || 1;

        return (visits > 3 && impressions < 4);
    }

    function showMessage() {
        var msg = new Message('appOnboard');
        msg.show(template);
    }

    function init() {
        if(isDevice() && canShow()) {
            showMessage();
        }
    }

    return {
        init: init
    };

});