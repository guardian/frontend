define([
    'common/modules/identity/api'
],
function (
    id
) {
    function CookieRefresh() {

        this.init = function () {
            id.refreshCookie();
        }
    }
    return CookieRefresh;
});
