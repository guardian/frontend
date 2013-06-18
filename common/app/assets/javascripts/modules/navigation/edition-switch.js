define([
    'common',
    'bean',
    'modules/cookies'],
    function (common, bean, Cookies) {

        function EditionSwitch() {
            var editionLinks = common.$g("a[data-edition]");
            editionLinks.each(function (link) {
                var edition = link.getAttribute("data-edition");
                bean.on(link, "click", function (event) {
                    Cookies.add("GU_EDITION", edition);
                });
            });
        }

        return EditionSwitch;
    });