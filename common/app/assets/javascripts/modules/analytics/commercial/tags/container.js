/**
 * A regionalised container for all the commercial tags.
 */
define([
    'common/modules/analytics/commercial/tags/common/audience-science',
    'common/modules/analytics/commercial/tags/common/imrworldwide',
    'common/modules/analytics/commercial/tags/au/amaa'
], function(
    AudienceScience,
    IMRWorldwide,
    Amaa
) {

    function init(config) {
        
        switch (config.page.edition.toLowerCase()) {

            case 'au':

                if (config.switches.amaa) {
                    Amaa.load();
                }

                break;

            default:
                
                if (config.switches.audienceScience) {
                    AudienceScience.load(config.page);
                }
                
                if (config.switches.imrWorldwide) {
                    IMRWorldwide.load();
                }
                
                break;
        }
    }
    
    return {
        init: init
    };

});
