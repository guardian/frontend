define(['common/utils/cookies'], function(Cookie) {

    // Foresee allow us to force the user to opt-in to a survey by setting a cookie 
    function storeForeseeForcingCookie () {
        return Cookie.add('fsr.sp', '%7B%22mobile_web%22%3A%22100%22%7D', 1);
    }

    function load() {
        
        var sample = Math.random() <= 0.05, // 5% sample rate
            hasForcedOptIn = /forceForesee/.test(location.hash);
    
        if (hasForcedOptIn) {
            storeForeseeForcingCookie();
        }

        // the Foresee code is large, we only want to load it in when necessary.
        if (sample || hasForcedOptIn) {
            require(['js!foresee'], function() {});
        }
    }
    
    return {
        load: load
    };

});
