define([
    'bean',
    'fastdom',
    'common/utils/$'
], function (
    bean,
    fastdom,
    $
) {

    function objToString(obj) {
        var str = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str += p + ': ' + obj[p] + '\n';
            }
        }
        return str;
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

    return {
        init: function () {
            registerEmailHandler('.js-tech-feedback-mailto');
            registerEmailHandler('.js-userhelp-mailto');
        }
    };
});
