define([
    'bean',
    'fastdom',
    'common/utils/_',
    'common/utils/$'
], function (
    bean,
    fastdom,
    _,
    $
) {
    function objToString(obj) {
        return _.reduce(obj, function (str, value, key) {
            return str + key + ': ' + value + '\n';
        }, '');
    }

    function addEmailHeaders(link) {
        return function () {
            var oldHref = link.attr('href');
            var props = {
                browser: window.navigator.userAgent,
                page: window.location,
                width: window.innerWidth
            };
            var body = '\r\n\r\n\r\n\r\n------------------------------\r\nAdditional technical data about your request - please do not edit:\r\n\r\n'
                + objToString(props)
                + '\r\n\r\n';
            link.attr('href', oldHref + '?body=' + encodeURIComponent(body));
        };
    }

    function registerEmailHandler(cssClass) {
        var link = $(cssClass);
        if (link.length) {
            bean.on(link[0], 'click', addEmailHeaders(link));
        }
    }

    return function () {
        registerEmailHandler('.js-tech-feedback-mailto');
        registerEmailHandler('.js-userhelp-mailto');
    };
});
