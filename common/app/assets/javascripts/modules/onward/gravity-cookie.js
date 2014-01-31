define([
        'common/utils/cookies'
], function(cookies) {

    var Gravity = {};

    Gravity.cookieName = 'grvinsights';

    Gravity.getGuId = function() {
        return cookies.get(Gravity.cookieName);
    };

    return Gravity;
});