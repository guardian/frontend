define([
    'common/utils/cookies',
    'common/utils/detect'
], function (
    Cookie,
    detect
) {

    function openForesee() {
        require(['js!foresee'], function () {});
    }

    function load() {

        var sampleRate = detect.getBreakpoint() === 'mobile' ? 0.08 : 0.006; // 8% mobile & 0.6% >mobile

        var sample = Math.random() <= sampleRate,
            hasForcedOptIn = /forceForesee/.test(location.hash);

        // the Foresee code is large, we only want to load it in when necessary.
        if (!Cookie.get('GU_TEST') && (sample || hasForcedOptIn)) {
            openForesee();
        }

        window.openForesee = openForesee;
    }

    return {
        load: load
    };

});
