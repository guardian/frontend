define(['common/utils/cookies'], function (cookies) {

    return {
        init: function () {
            cookies.remove('GU_ME');
        }
    };

});
