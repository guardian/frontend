define([
    'common/utils/cookies'
], function(
    cookies
) {

    return {
        hasOptedIntoResponsive: function(){
            var guViewCookie = cookies.get('GU_VIEW');
            return guViewCookie && /.*(responsive|mobile).*/.test(guViewCookie);
        }
    };

});
