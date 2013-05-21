/**
 * TODO - temporary till we have proper single domain editions
 */
define([
    'common',
    'modules/userPrefs',
    'bean',
    'bonzo'],
    function (common, userPrefs, bean, bonzo) {

    var AUS = "australia-edition",
        currentContext;

    function AustraliaEdition(config) {

        bean.on(document, 'click', '.edition', function(e) {

            if (bonzo(e.target).hasClass('edition-au')) {
                userPrefs.switchOn(AUS);
            } else {
                userPrefs.switchOff(AUS);
            }
        });

        this.init = function(context) {
            currentContext = context;

            if (userPrefs.isOn(AUS)) {
                // convert all home links to AUS front
                common.$g("a[href='/']", currentContext).attr("href", "/australia");

                // convert AU edition link back to UK link
                // Note: This is slightly confusing as the current AUS edition is
                // temporarily just the UK edition, so we need to re-add the link back
                if (config.page.edition === "UK") {
                    common.$g(".edition-au", currentContext).each(function(e) {
                        var ukHref = e.href.replace('/australia', '/'),
                            ukLink = '<a class="nav__link edition" data-link-name="switch to uk edition" href="'+ukHref+'">UK edition</a>';

                        bonzo(e.parentNode).html(ukLink);
                    });
                }
            }
        };
    }

    return AustraliaEdition;
});
