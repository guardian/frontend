define([
    'bean',
    'common/utils/$',
    'common/utils/cookies'
], function (bean,
             $,
             cookies) {

    var cookieName = 'adtest';

    function status() {
        var adTestCookie = cookies.get(cookieName);

        if (adTestCookie == null) {
            $('#cookie_status')
                .text('Your browser has no test cookie set.')
                .addClass('hasnt_cookie');
            $('#clear_cookie').hide();
        } else {
            $('#cookie_status')
                .text('Your browser has test cookie \'' + adTestCookie + '\' set.')
                .addClass('has_cookie');
        }
    }

    function init() {

        status();

        bean.on(document, 'click', '.cookie', function (event) {
            var cookieValue = event.srcElement.text;
            cookies.add(cookieName, cookieValue, 10);
            $('#clear_cookie').show();
            status();
        });

        bean.on(document, 'click', '#clear_cookie', function () {
            cookies.remove(cookieName);
            $('#clear_cookie').hide();
            status();
        });
    }

    return {
        init: init
    };

});
