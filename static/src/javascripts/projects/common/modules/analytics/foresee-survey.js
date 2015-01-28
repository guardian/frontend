define([
    'common/utils/config',
    'common/utils/cookies',
    'common/utils/detect'
], function (
    config,
    Cookie,
    detect
) {

    function openForesee() {
        require(['js!foresee']);
    }

    function load() {

        var isNetworkFront = config.page.contentType === 'Network Front',
            hasForcedOptIn = /forceForesee/.test(location.hash);

        // the Foresee code is large, we only want to load it in when necessary.
        if (!Cookie.get('GU_TEST') && !isNetworkFront && (window.openForeseeWhenReady || hasForcedOptIn)) {
            openForesee();
        }

        if (window.guardian) {
            window.guardian.openForesee = openForesee;
        }
    }

    return {
        load: load
    };

});
