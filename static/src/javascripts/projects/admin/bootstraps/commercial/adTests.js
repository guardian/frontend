define([
    'bean',
    'common/utils/$',
    'common/utils/cookies'
], function (bean,
             $,
             cookies) {

    var cookieName = 'adtest',

    // cookie in this domain to track adtest cookie in theguardian.com
        trackingCookieName = 'adtest-tracker';

    function status() {
        var trackingCookieValue = cookies.get(trackingCookieName);

        $('.cookie-row').removeClass('selected');

        if (trackingCookieValue == null) {
            $('#cookie-status')
                .text('Your browser has no test cookie set.')
                .addClass('hasnt-cookie');
            $('#clear-cookie').hide();
        } else {
            $('#cookie-status')
                .text('Your browser has test cookie \'' + trackingCookieValue + '\' set.')
                .addClass('has-cookie');

            $('#cookie-' + trackingCookieValue).addClass('selected');
        }
    }

    function setCookie(cookieValue) {
        var url = 'http://www.theguardian.com/uk?' + cookieName + '=' + cookieValue;
        var cookieSettingWindow = window.open(url, '_blank', 'width=100,height=100');
        setTimeout(function () {
            cookieSettingWindow.close();
        }, 1000);
    }

    function init() {

        status();

        bean.on(document, 'click', '.cookie', function (event) {
            var cookieValue = event.srcElement.value;
            setCookie(cookieValue);
            cookies.add(trackingCookieName, cookieValue, 10);
            $('#clear-cookie').show();
            status();
        });

        bean.on(document, 'click', '#clear-cookie', function () {
            setCookie('clear');
            cookies.remove(trackingCookieName);
            $('#clear-cookie').hide();
            status();
        });
    }

    return {
        init: init
    };

});
