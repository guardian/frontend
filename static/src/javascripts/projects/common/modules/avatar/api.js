define([
    'common/utils/ajax',
    'common/utils/config'
], function (
    ajax,
    config
) {

    var apiUrl = config.page.avatarApiUrl + '/v1';
    var Api = {};

    Api.request = function (method, path, data) {
        var params = {
            url: apiUrl + path,
            type: 'json',
            data: data || {},
            processData : false,
            method: method,
            crossOrigin: true,
            withCredentials: true
        };

        return ajax(params);
    };

    Api.getActive = function () {
        return Api.request('GET', '/avatars/user/me/active');
    };

    Api.updateAvatar = function (data) {
        return Api.request('POST', '/avatars', data);
    };

    return Api;
});
