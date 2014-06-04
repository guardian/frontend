define([
    'common/utils/storage',
    'common/utils/template',
    'common/modules/userPrefs',
    'common/modules/ui/message'
], function(
    storage,
    template,
    userPrefs,
    Message
){

    /**
     * Rules:
     *
     * 3 impressions
     * Persist close state
     */

    var IMPRESSION_KEY = 'gu.ads.viewsCounter',
        impressions = (storage.local.get(IMPRESSION_KEY)) ? parseInt(storage.local.get(IMPRESSION_KEY), 10) : 0,
        tpl = 'Help us shape the next Guardian website. ' +
            '<a href="https://s.userzoom.com/p/MSBDMTBTMTQ2/155635374930492396871#uz_welcome">Take our survey!</a>';

    storage.local.set(IMPRESSION_KEY, ++impressions);

    function canShow() {
        return impressions >= 3;
    }

    function showMessage() {
        new Message('surveyBanner').show(template(tpl, {}));
    }

    function init() {
        if(canShow()) {
            showMessage();
        }
    }

    return {
        init: init
    };

});
