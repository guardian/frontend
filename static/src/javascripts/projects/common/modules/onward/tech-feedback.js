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

    return {
        init: function () {
            var link = $('.js-tech-feedback-mailto');
            if (link.length) {
                bean.on(link[0], 'click', function () {
                    var oldHref = link.attr('href');
                    var props = {
                        referrer: document.referrer,
                        width: window.innerWidth
                    };
                    var body = '\r\n\r\n\r\n\r\n------------------------------\r\nAdditional technical data about your request - please do not edit:\r\n\r\n'
                        + objToString(props)
                        + '\r\n\r\n';
                    link.attr('href', oldHref + '?body=' + encodeURIComponent(body));
                });
            }

        }
    };
});
