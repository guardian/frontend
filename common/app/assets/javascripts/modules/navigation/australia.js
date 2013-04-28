/**
 * TODO - temporary till we have proper single domain editions
 */
define([
    'common',
    'modules/userPrefs',
    'bean'],
    function (common, userPrefs, bean) {

    var AUS = "australia-edition";

    function AustraliaEdition() {
        var auLink = document.querySelector("#au-link");
        var editionSwitch = document.querySelector("#edition-switch");

        if (auLink) {
            bean.add(auLink, "click", function(){
                userPrefs.switchOn(AUS);
            });
        }

        if (editionSwitch) {
            bean.add(editionSwitch, "click", function(){
                userPrefs.switchOff(AUS);
            });
        }

        if (userPrefs.isOn(AUS)) {
            // convert all home links to AUS front
            common.$g("a[href='/']").each(function(link){
                link.href = "/australia";
            });
        }
    }

    return AustraliaEdition;
});
