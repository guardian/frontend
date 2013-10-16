define([
    'common',
    'ajax',
    'modules/cookies'
], function(
    common,
    ajax,
    cookies
) {

/**
 * Singleton to deal with Discussion API requests
 * @type {Object}
 */
var Api = {
    root: null,
    clientHeader: null
};

/**
 * @param {Object.<string.*>}
 */
Api.init = function(config) {
    Api.root = config.page.discussionApiRoot;
    Api.header = config.page.discussionApiClientHeader;
};

/**
 * @param {string} endpoint
 * @param {string} method
 * @param {Object.<string.*>} data
 * @param {Boolean} anon
 * @return {Reqwest} a promise
 */
Api.send = function(endpoint, method, data, anon) {
    data = data || {};
    if (!anon && cookies.get('GU_U')) {
        data.GU_U = cookies.get('GU_U');
    }

    return ajax({
        url: Api.root + endpoint,
        type: 'json',
        method: method,
        crossOrigin: true,
        data: data,
        headers: {
            'D2-X-UID': 'zHoBy6HNKsk',
            'GU-Client': Api.clientHeader
        }
    });
};

/**
 * @param {string} discussionId
 * @param {Object.<string.*>} comment
 * @return {Reqwest} a promise
 */
Api.postComment = function(discussionId, comment) {
    var endpoint = '/discussion/'+ discussionId +'/comment';
    return Api.send(endpoint, 'post', comment);
};

/**
 * @param {number} id the comment ID
 * @return {Reqwest} a promise
 */
Api.recommendComment = function(id) {
    var endpoint = '/comment/'+ id +'/recommend';
    return Api.send(endpoint, 'post', {}, true);
};

return Api;

});