// @flow

/*
  Implements outbrain codes according to the new structure defined
  here: https://trello.com/c/r1TDqVKP
*/

const normalizedTypes = {
    defaults: 'defaults',
    merchandising: 'nonCompliant',
    nonCompliant: 'nonCompliant',
};

/*
  Note that outbrain has asked the same codes as desktop
  for the tablet breakpoint.
*/
const outbrainCodes = {
    defaults: {
        desktop: { code: 'AR_12' },
        tablet: { code: 'AR_12' },
        mobile: { code: 'MB_4' },
    },
    epic: {
        desktop: { code: 'AR_13' },
        tablet: { code: 'AR_13' },
        mobile: { code: 'MB_5' },
    },
    nonCompliant: {
        desktop: { code: 'AR_14' },
        tablet: { code: 'AR_14' },
        mobile: { code: 'MB_10' },
    },
};

const outbrainCode = function(
    paramSet: string,
    breakpoint: string
): { code?: string, image?: string, text?: string } {
    const byParamSet = outbrainCodes[paramSet];
    if (!byParamSet) {
        throw new Error(`Unknown outbrain param set  (${paramSet})`);
    }
    const byBreakpoint = byParamSet[breakpoint];
    if (!byBreakpoint) {
        throw new Error(`Unknown outbrain breakpoint (${breakpoint})`);
    }
    return { code: byBreakpoint.code };
};

const getCode = function(args: {
    outbrainType: string,
    contributionEpicVisible: boolean,
    breakpoint: string,
    section: string,
}): { code?: string, image?: string, text?: string } {
    const normalizedType = normalizedTypes[args.outbrainType];
    if (!normalizedType) {
        throw new Error(`Unknown outbrainType (${args.outbrainType})`);
    }
    const normalizedBreakpoint =
        args.breakpoint === 'wide' ? 'desktop' : args.breakpoint;

    if (normalizedType === 'defaults') {
        return outbrainCode('defaults', normalizedBreakpoint);
    }
    if (normalizedType === 'nonCompliant') {
        if (args.contributionEpicVisible) {
            return outbrainCode('epic', normalizedBreakpoint);
        }
        return outbrainCode('nonCompliant', normalizedBreakpoint);
    }
    // No other possibility as normalizedType can only have this set of values.
    // note that for flow, we still need to return something
    return outbrainCode('nonCompliant', normalizedBreakpoint);
};

export { getCode };
