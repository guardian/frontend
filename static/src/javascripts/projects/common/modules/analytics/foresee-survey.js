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
        require(['js!foresee.js']);
    }

    function load() {

        var isNetworkFront = config.page.contentType === 'Network Front',
            sampleRate = detect.isBreakpoint({max: 'mobile'}) ? 0.008 : 0.006, // 0.8% mobile and 0.6% rest
            sample = Math.random() <= sampleRate,
            hasForcedOptIn = /forceForesee/.test(location.hash);

        // the Foresee code is large, we only want to load it in when necessary.
        if (!Cookie.get('GU_TEST') && !isNetworkFront && (window.openForeseeWhenReady || sample || hasForcedOptIn)) {
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
