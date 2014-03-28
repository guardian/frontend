/**
 * A regionalised container for all the commercial tags.
 */
define([
    'common/modules/analytics/commercial/tags/common/audience-science',
    'common/modules/analytics/commercial/tags/common/imrworldwide',
    'common/modules/analytics/commercial/tags/au/amaa',
    'common/modules/analytics/commercial/tags/au/effective-measure'
], function(
    AudienceScience,
    IMRWorldwide,
    Amaa,
    EffectiveMeasure
) {

    function init(config) {
        
        switch (config.page.edition.toLowerCase()) {

            case 'au':

                if (config.switches.amaa) {
                    Amaa.load();
                }
                
                if (config.switches.effectiveMeasure) {
                    EffectiveMeasure.load();
                }

                if (config.switches.imrWorldwide) {
                    IMRWorldwide.load();
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
