define(['common/utils/cookies'], function (Cookie) {

    function load() {

        var sample = Math.random() <= 0.05, // 5% sample rate
            hasForcedOptIn = /forceForesee/.test(location.hash);

        // the Foresee code is large, we only want to load it in when necessary.
        if (!Cookie.get('GU_TEST') && (sample || hasForcedOptIn)) {
            require(['js!foresee'], function () {});
        }
    }

    return {
        load: load
    };

});
