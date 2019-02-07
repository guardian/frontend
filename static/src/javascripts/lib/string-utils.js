// @flow

// Split by delimiter, but ensure any whitespace in the string is discarded
// and that there are no empty strings in the output array.
export const splitAndTrim = (str: string, delim: string): Array<string> =>
    str
        .split(delim)
        .map(s => s.trim())
        .filter(Boolean);

export const optionalSplitAndTrim = (str: string, delim: string): Array<string> =>
    str ? splitAndTrim(str, delim) : [];
