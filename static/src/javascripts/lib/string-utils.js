// Split by delimiter, but ensure any whitespace in the string is discarded
// and that there are no empty strings in the output array.
export const splitAndTrim = (str, delim) =>
    str
        .split(delim)
        .map(s => s.trim())
        .filter(Boolean);

export const optionalSplitAndTrim = (
    str,
    delim
) => (str ? splitAndTrim(str, delim) : []);

export const optionalStringToBoolean = (str) =>
    typeof str === 'string' ? str.toLowerCase().trim() === 'true' : false;

export const throwIfEmptyString = (name, str) => {
    if (typeof str === 'string' && str.trim().length > 0) {
        return str;
    }

    throw new Error(`${name} is empty`);
};

export const filterEmptyString = (str) =>
    str && str.trim().length > 0 ? str.trim() : undefined;
