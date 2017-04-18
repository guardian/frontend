define([
    'lib/fetch-json',
    'lib/config'
], function (
    fetchJSON,
    config
) {

    var apiUrl = config.page.avatarApiUrl + '/v1';
    var staticUrl = config.page.avatarImagesUrl + '/user';
    var Api = {};

    Api.request = function (method, path, data) {
        return fetchJSON(apiUrl + path, {
            body: data || {},
            method: method,
            mode: 'cors',
        });
    };

    // A user's 'active' avatar is only available to signed-in users as it
    // includes avatars in a pre-mod state.
    Api.getActive = function () {
        return Api.request('GET', '/avatars/user/me/active');
    };

    Api.updateAvatar = function (data) {
        return Api.request('POST', '/avatars', data);
    };

    // The deterministic URL always returns an image. If the user has no avatar,
    // a default image is returned.
    Api.deterministicUrl = function (userId) {
        return staticUrl + '/' + userId;
    };

    return Api;
});
