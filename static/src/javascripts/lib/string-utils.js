// @flow

// Split by delimiter, but ensure any whitespace in the string is discarded
// and that there are no empty strings in the output array.
export const splitAndTrim = (str: string, delim: string): Array<string> =>
    str
        .split(delim)
        .map(s => s.trim())
        .filter(Boolean);

export const optionalSplitAndTrim = (
    str: string,
    delim: string
): Array<string> => (str ? splitAndTrim(str, delim) : []);

export const optionalStringToBoolean = (str: ?string): boolean =>
    typeof str === 'string' ? str.toLowerCase().trim() === 'true' : false;

export const throwIfEmptyString = (name: string, str: ?string): string => {
    if (typeof str === 'string' && str.trim().length > 0) {
        return str;
    }

    throw new Error(`${name} is empty`);
};

export const filterEmptyString = (str: ?string): ?string =>
    str && str.trim().length > 0 ? str.trim() : undefined;
