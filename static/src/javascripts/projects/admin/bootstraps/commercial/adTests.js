define([
    'bean',
    'common/utils/$',
    'common/utils/cookies'
], function (bean,
             $,
             cookies) {

    var cookieName = 'adtest',

    // cookie in this domain to track adtest cookie in theguardian.com
        trackingCookieName = 'adtest_tracker';

    function status() {
        var trackingCookie = cookies.get(trackingCookieName);

        if (trackingCookie == null) {
            $('#cookie_status')
                .text('Your browser has no test cookie set.')
                .addClass('hasnt_cookie');
            $('#clear_cookie').hide();
        } else {
            $('#cookie_status')
                .text('Your browser has test cookie \'' + trackingCookie + '\' set.')
                .addClass('has_cookie');
        }
    }

    function createIframe() {
        ifrm = document.createElement('iframe');
        ifrm.style.width = '1px';
        ifrm.style.height = '1px';
        document.body.appendChild(ifrm);
        return ifrm;
    }

    function setCookie(ifrm, cookieValue) {
        ifrm.setAttribute('src',
            'http://www.theguardian.com/uk?' + cookieName + '=' + cookieValue);
    }

    function init() {

        status();

        var ifrm = createIframe();

        bean.on(document, 'click', '.cookie', function (event) {
            var cookieValue = event.srcElement.text;
            setCookie(ifrm, cookieValue);
            cookies.add(trackingCookieName, cookieValue, 10);
            $('#clear_cookie').show();
            status();
        });

        bean.on(document, 'click', '#clear_cookie', function () {
            setCookie(ifrm, 'clear');
            cookies.remove(trackingCookieName);
            $('#clear_cookie').hide();
            status();
        });
    }

    return {
        init: init
    };

});
