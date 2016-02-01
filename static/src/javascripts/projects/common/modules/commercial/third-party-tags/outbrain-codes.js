define([
    'common/modules/commercial/third-party-tags/outbrain-sections'
], function (getSection) {
    /* These codes are given to us directly by Outbrain. They will eventually
       be sent back to them via a data- attribute, in order for them to return
       contextually-relevant links. The codes differ whether on a smartphone,
       tablet or desktop. Also, except on mobile, we will request two sets of
       links from Outbrain, hence the two codes in some contexts.
       Currently, there are two categories of codes:
       1. defaults: these are the codes used by default for the Outbrain widget
       2. merchandising: these are the codes when the widget replaces the low-
        priority merchandising component
    */
    var outbrainCodes = {
        defaults: {
            news: {
                mobile:  { code: 'MB_4' },
                desktop: { image: 'AR_12', text: 'AR_14' },
                tablet:  { image: 'MB_6', text: 'MB_8' }
            },
            defaults: {
                mobile:  { code: 'MB_5' },
                desktop: { image: 'AR_13', text: 'AR_15' },
                tablet:  { image: 'MB_7', text: 'MB_9' }
            }
        },

        merchandising: {
            UK: {
                mobile:  { code: 'MB_10' },
                desktop: { code: 'AR_28' },
                tablet:  { code: 'MB_11' }
            },
            US: {
                mobile:  { code: 'CRMB_55' },
                desktop: { code: 'CR_13' },
                tablet:  { code: 'CRMB_56' }
            },
            AU: {
                mobile:  { code: 'CRMB_57' },
                desktop: { code: 'CR_14' },
                tablet:  { code: 'CRMB_58' }
            },
            INT: {
                mobile:  { code: 'CRMB_59' },
                desktop: { code: 'CR_15' },
                tablet:  { code: 'CRMB_60' }
            }
        }
    };

    function getCode(data) {
        if (!(data.slot in outbrainCodes) || data.slot === 'defaults') {
            return outbrainCodes.outbrain[getSection(data.section)][data.breakpoint === 'wide' ? 'desktop' : data.breakpoint];
        } else {
            return outbrainCodes.merchandising[data.edition][data.breakpoint === 'wide' ? 'desktop' : data.breakpoint];
        }
    }

    return getCode;
});
