// @flow
import { getSection } from './outbrain-sections';
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
const outbrainCodes = {
    defaults: {
        news: {
            mobile: {
                code: 'MB_4',
            },
            desktop: {
                image: 'AR_12',
                text: 'AR_14',
            },
            tablet: {
                image: 'MB_6',
                text: 'MB_8',
            },
        },
        defaults: {
            mobile: {
                code: 'MB_5',
            },
            desktop: {
                image: 'AR_13',
                text: 'AR_15',
            },
            tablet: {
                image: 'MB_7',
                text: 'MB_9',
            },
        },
    },
    // This is the same as 'nonCompliant'
    merchandising: {
        mobile: {
            code: 'MB_10',
        },
        desktop: {
            code: 'AR_28',
        },
        tablet: {
            code: 'MB_11',
        },
    },

    nonCompliant: {
        mobile: {
            code: 'MB_10',
        },
        desktop: {
            code: 'AR_28',
        },
        tablet: {
            code: 'MB_11',
        },
    },
};

const getCode = function(args: {
    outbrainType: string,
    breakpoint: string,
    section: string,
}): { code?: string, image?: string, text?: string } {
    const normalizedBreakpoint =
        args.breakpoint === 'wide' ? 'desktop' : args.breakpoint;

    if (
        !(args.outbrainType in outbrainCodes) ||
        args.outbrainType === 'defaults'
    ) {
        return outbrainCodes.defaults[getSection(args.section)][
            normalizedBreakpoint
        ];
    } else if (args.outbrainType === 'nonCompliant') {
        return outbrainCodes.nonCompliant[normalizedBreakpoint];
    }
    return outbrainCodes.merchandising[normalizedBreakpoint];
};

export { getCode };
