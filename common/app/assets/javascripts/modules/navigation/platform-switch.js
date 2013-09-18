define([
    'common',
    'bean',
    'modules/cookies'],
    function (common, bean, Cookies) {

        function PlatformSwitch() {
            var platformLinks = common.$g(".js-main-site-link");
            platformLinks.each(function (link) {
                bean.on(link, "click", function (event) {
                    var expiryDays = 7;
                    Cookies.add("GU_VIEW", "desktop", expiryDays);
                });
            });
        }

        return PlatformSwitch;
    });