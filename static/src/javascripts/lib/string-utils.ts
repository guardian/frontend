

// Split by delimiter, but ensure any whitespace in the string is discarded
// and that there are no empty strings in the output array.
export const splitAndTrim = (str: string, delim: string): Array<string> => str.split(delim).map(s => s.trim()).filter(Boolean);

export const optionalSplitAndTrim = (str: string, delim: string): Array<string> => str ? splitAndTrim(str, delim) : [];

export const optionalStringToBoolean = (str: string | null | undefined): boolean => typeof str === 'string' ? str.toLowerCase().trim() === 'true' : false;

export const throwIfEmptyString = (name: string, str: string | null | undefined): string => {
  if (typeof str === 'string' && str.trim().length > 0) {
    return str;
  }

  throw new Error(`${name} is empty`);
};

export const filterEmptyString = (str: string | null | undefined): string | null | undefined => str && str.trim().length > 0 ? str.trim() : undefined;