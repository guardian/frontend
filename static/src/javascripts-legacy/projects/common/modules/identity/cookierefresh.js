define([
    'common/modules/identity/api',
    'lib/storage'
],
function (
    Id,
    storage
) {
    function CookieRefresh() {
        this.init = function () {
            if (storage.localStorage.isAvailable() && Id.isUserLoggedIn()) {
                var lastRefresh = storage.localStorage.get(Id.lastRefreshKey),
                    currentTime = new Date().getTime();
                if (this.shouldRefreshCookie(lastRefresh, currentTime)) {
                    Id.getUserFromApiWithRefreshedCookie();
                    storage.localStorage.set(Id.lastRefreshKey, currentTime);
                }
            }
        };

        CookieRefresh.prototype.shouldRefreshCookie = function (lastRefresh, currentTime) {
            return (!lastRefresh) || (currentTime > (parseInt(lastRefresh, 10) + (1000 * 86400 * 30)));
        };
    }
    return CookieRefresh;
});
