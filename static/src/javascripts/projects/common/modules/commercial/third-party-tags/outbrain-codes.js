define([
    'common/modules/commercial/third-party-tags/outbrain-sections'
], function (getSection) {
    var outbrainCodes = {
        outbrain: {
            1: {
                mobile:  { code: 'MB_4' },
                desktop: { image: 'AR_12', text: 'AR_14' },
                tablet:  { image: 'MB_6', text: 'MB_8' }
            },
            2: {
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
        if (!(data.slot in outbrainCodes) || data.slot === 'outbrain') {
            return outbrainCodes.outbrain[getSection(data.section)][data.breakpoint === 'wide' ? 'desktop' : data.breakpoint];
        } else {
            return outbrainCodes.merchandising[data.edition][data.breakpoint === 'wide' ? 'desktop' : data.breakpoint];
        }
    }

    return getCode;
});
