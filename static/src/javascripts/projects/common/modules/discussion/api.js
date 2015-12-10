define([
    'common/modules/user-prefs',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/cookies'
], function (
    prefs,
    ajax,
    config,
    cookies
) {

    var toHTTPS = function (url) {
        return url.replace(/^http:\/\//i, 'https://');
    };

    /**
     * Singleton to deal with Discussion API requests
     * @type {Object}
     */
    var root = config.page.discussionApiRoot,
        Api = {
            root: root,
            proxyRoot: (config.switches.discussionProxy ?
                (config.switches.discussionHttps ?
                    toHTTPS(config.page.host + '/guardianapis/discussion/discussion-api') :
                config.page.host + '/guardianapis/discussion/discussion-api') :
                root),
            clientHeader: config.page.discussionApiClientHeader
        };

    /**
     * @param {string} endpoint
     * @param {string} method
     * @param {Object.<string.*>} data
     * @return {Reqwest} a promise
     */
    Api.send = function (endpoint, method, data, useProxy) {
        var shouldUseProxy = useProxy || false;
        var root = (method === 'post' || shouldUseProxy) ? Api.proxyRoot : Api.root;
        data = data || {};
        // TODO remove this once we turn the discussionHttps switch on permanently
        if (cookies.get('GU_U')) {
            data.GU_U = cookies.get('GU_U');
        }

        var request = ajax({
            url: root + endpoint,
            type: (method === 'get') ? 'jsonp' : 'json',
            method: method,
            crossOrigin: true,
            data: data,
            headers: {
                'D2-X-UID': 'zHoBy6HNKsk',
                'GU-Client': Api.clientHeader
            },
            withCredentials: true
        });

        return request;
    };

    /**
     * @param {string} discussionId
     * @param {Object.<string.*>} comment
     * @return {Reqwest} a promise
     */
    Api.postComment = function (discussionId, comment) {
        var endpoint = '/discussion/' + discussionId + '/comment' +
            (comment.replyTo ? '/' + comment.replyTo.commentId + '/reply' : '');

        return Api.send(endpoint, 'post', comment);
    };

    /**
     * @param {string} comment
     * @return {Reqwest} a promise
     */
    Api.previewComment = function (comment) {
        var endpoint = '/comment/preview';
        return Api.send(endpoint, 'post', comment);
    };

    /**
     * @param {number} id the comment ID
     * @return {Reqwest} a promise
     */
    Api.recommendComment = function (id) {
        var endpoint = '/comment/' + id + '/recommend';
        return Api.send(endpoint, 'post');
    };

    /**
     * @param {number} id the comment ID
     * @return {Reqwest} a promise
     */
    Api.pickComment = function (id) {
        var endpoint = '/comment/' + id + '/highlight';
        return Api.send(endpoint, 'post');
    };

    /**
     * @param {number} id the comment ID
     * @return {Reqwest} a promise
     */
    Api.unPickComment = function (id) {
        var endpoint = '/comment/' + id + '/unhighlight';
        return Api.send(endpoint, 'post');
    };

    /**
     * @param {number} id the comment ID
     * @param {Object.<string.string>} report the report info in the form of:
              { reason: string, emailAddress: string, categoryId: number }
     * @return {Reqwest} a promise
     */
    Api.reportComment = function (id, report) {
        var endpoint = '/comment/' + id + '/reportAbuse';
        return Api.send(endpoint, 'post', report);
    };

    /**
     * The id here is optional, but you shoudl try to specify it
     * If it isn't we use profile/me, which isn't as cachable
     * @param {number=} id (optional)
     */
    Api.getUser = function (id) {
        var endpoint = '/profile/' + (!id ? 'me' : id);
        return Api.send(endpoint, 'get', null, true);
    };

    return Api;

});
