define([
    'common/utils/cookies',
    'common/utils/detect'
], function (
    Cookie,
    detect
) {

    function openForesee() {
        require(['js!foresee']);
    }

    function load() {

        var sampleRate = detect.getBreakpoint() === 'mobile' ? 0.03 : 0.003, // 3% mobile & 0.3% >mobile
            sample = Math.random() <= sampleRate,
            hasForcedOptIn = /forceForesee/.test(location.hash);

        // the Foresee code is large, we only want to load it in when necessary.
        if (!Cookie.get('GU_TEST') && (window.openForeseeWhenReady || sample || hasForcedOptIn)) {
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
