// @flow strict
import { log } from 'commercial/modules/cmp/log';

const SIX_BIT_ASCII_OFFSET = 65;
const NUM_BITS_VERSION = 6;

type Field = {
    name: string,
    type: string,
    input?: string,
    numBits: (input: {}) => number | number,
    decoder?: (
        input: string,
        output: {},
        startPosition?: number
    ) => { fieldValue?: mixed, newPosition?: number },
    encoder?: (input: {}) => number,
    validator?: (input: {}) => boolean,
    listCount?: number,
    fields?: Array<Field>,
};

const repeat = (count: number, string: string = '0'): string => {
    let padString = '';
    for (let i = 0; i < count; i += 1) {
        padString += string;
    }
    return padString;
};

const padLeft = (string: string, padding: number): string =>
    repeat(Math.max(0, padding)).toString() + string;

const padRight = (string: string, padding: number): string =>
    string + repeat(Math.max(0, padding));

const encodeIntToBits = (number: mixed, numBits: ?number): string => {
    let bitString = '';
    if (typeof number === 'number' && !Number.isNaN(number)) {
        bitString = parseInt(number, 10).toString(2);
    }

    // Pad the string if not filling all bits
    // flowlint sketchy-null-number:warn
    if (numBits && numBits >= bitString.length) {
        bitString = padLeft(bitString, numBits - bitString.length);
    }

    // Truncate the string if longer than the number of bits
    if (numBits && numBits < bitString.length) {
        bitString = bitString.substring(0, numBits);
    }
    return bitString;
};

const getEncoded = (string: string): string => {
    if (typeof string !== 'string') {
        return '';
    }
    return string
        .split('')
        .map(char => {
            const int = Math.max(
                0,
                char.toUpperCase().charCodeAt(0) - SIX_BIT_ASCII_OFFSET
            );
            return encodeIntToBits(int > 25 ? 0 : int, 6);
        })
        .join('');
};

/**
 * Encodes each character of a string in 6 bits starting
 * with [aA]=0 through [zZ]=25
 */
const encode6BitCharacters = (string: string, numBits: number): string => {
    const encoded = getEncoded(string);
    return padRight(encoded, numBits).substr(0, numBits);
};

const encodeBoolToBits = (value: mixed): string =>
    encodeIntToBits(value === true ? 1 : 0, 1);

const encodeDateToBits = (date: mixed, numBits: number): string => {
    if (date instanceof Date) {
        return encodeIntToBits(date.getTime() / 100, numBits);
    }
    return encodeIntToBits(date, numBits);
};

const decodeBitsToInt = (
    bitString: string,
    start: number,
    length: number
): number => {
    const str = bitString.substr(start, length);
    return parseInt(str, 2);
};

const decodeBitsToDate = (
    bitString: string,
    start: number,
    length: number
): Date => new Date(decodeBitsToInt(bitString, start, length) * 100);

const decodeBitsToBool = (bitString: string, start: number): boolean => {
    const str = bitString.substr(start, 1);
    return parseInt(str, 2) === 1;
};

const decode6BitCharacters = (
    bitString: string,
    start: number,
    length: number
): string => {
    let decoded = '';
    let decodeStart = start;
    while (decodeStart < start + length) {
        decoded += String.fromCharCode(
            SIX_BIT_ASCII_OFFSET + decodeBitsToInt(bitString, decodeStart, 6)
        );
        decodeStart += 6;
    }
    return decoded;
};

const encodeFields = ({ input, fields }: { input: {}, fields: Array<Field> }) =>
    fields.reduce((acc, field) => {
        // eslint-disable-next-line no-use-before-define
        const res: string = acc + encodeField({ input, field });
        return res;
    }, '');

const encodeField = ({ input, field }: { input: {}, field: Field }) => {
    const { name, type, numBits, encoder, validator } = field;
    if (typeof validator === 'function') {
        if (!validator(input)) {
            return '';
        }
    }
    if (typeof encoder === 'function') {
        return encoder(input);
    }

    const bitCount = typeof numBits === 'function' ? numBits(input) : numBits;

    const inputValue: mixed = input[name];
    const fieldValue: mixed =
        inputValue === null || inputValue === undefined ? '' : inputValue;
    switch (type) {
        case 'int':
            return encodeIntToBits(fieldValue, bitCount);
        case 'bool':
            return encodeBoolToBits(fieldValue);
        case 'date':
            return encodeDateToBits(fieldValue, bitCount);
        case 'bits':
            if (typeof fieldValue === 'string') {
                return padRight(
                    fieldValue,
                    bitCount - fieldValue.length
                ).substring(0, bitCount);
            }
            return '';
        case '6bitchar':
            if (typeof fieldValue === 'string') {
                return encode6BitCharacters(fieldValue, bitCount);
            }
            return '';
        case 'list':
            if (Array.isArray(fieldValue)) {
                return fieldValue.reduce(
                    (acc, listValue) =>
                        acc +
                        encodeFields({
                            // $FlowFixMe we have gotten this far... this will okay
                            input: listValue,
                            fields: field.fields ? field.fields : [],
                        }),
                    ''
                );
            }
            return '';
        default:
            log.warn(
                `Cookie definition field found without encoder or type: ${name}`
            );
            return '';
    }
};

type DecodeFields = {
    input: string,
    fields: Array<Field>,
    startPosition?: number,
};

const decodeFields = ({ input, fields, startPosition = 0 }: DecodeFields) => {
    let position = startPosition;
    const decodedObject = fields.reduce((acc, field) => {
        const { name, numBits } = field;
        // eslint-disable-next-line no-use-before-define
        const { fieldValue, newPosition } = decodeField({
            input,
            output: acc,
            startPosition: position,
            field,
        });
        if (fieldValue !== undefined) {
            acc[name] = fieldValue;
        }
        if (newPosition !== undefined) {
            position = newPosition;
        } else if (typeof numBits === 'number') {
            position += numBits;
        }
        return acc;
    }, {});
    return {
        decodedObject,
        newPosition: position,
    };
};

const decodeField = ({
    input,
    output,
    startPosition,
    field,
}): { fieldValue?: mixed, newPosition?: number } => {
    const { type, numBits, decoder, validator, listCount } = field;
    if (typeof validator === 'function') {
        if (!validator(output)) {
            // Not decoding this field so make sure we start parsing the next field at
            // the same point
            return { newPosition: startPosition };
        }
    }
    if (typeof decoder === 'function') {
        return decoder(input, output, startPosition);
    }

    const bitCount = typeof numBits === 'function' ? numBits(output) : numBits;

    const listEntryCount: number = (() => {
        if (typeof listCount === 'function') {
            return listCount(output);
        }
        return typeof listCount === 'number' ? listCount : 0;
    })();

    switch (type) {
        case 'int':
            return {
                fieldValue: decodeBitsToInt(input, startPosition, bitCount),
            };
        case 'bool':
            return { fieldValue: decodeBitsToBool(input, startPosition) };
        case 'date':
            return {
                fieldValue: decodeBitsToDate(input, startPosition, bitCount),
            };
        case 'bits':
            return {
                fieldValue: input.substr(startPosition, bitCount),
            };
        case '6bitchar':
            return {
                fieldValue: decode6BitCharacters(
                    input,
                    startPosition,
                    bitCount
                ),
            };
        case 'list':
            return new Array(listEntryCount).fill().reduce(
                acc => {
                    const { decodedObject, newPosition } = decodeFields({
                        input,
                        fields: field.fields ? field.fields : [],
                        startPosition: acc.newPosition,
                    });
                    return {
                        fieldValue: [...acc.fieldValue, decodedObject],
                        newPosition,
                    };
                },
                { fieldValue: [], newPosition: startPosition }
            );
        default:
            log.warn(`Cookie definition field found without decoder or type`);
            return {};
    }
};

/**
 * Encode the data properties to a bit string. Encoding will encode
 * either `selectedVendorIds` or the `vendorRangeList` depending on
 * the value of the `isRange` flag.
 */
const encodeDataToBits = (
    data: { cookieVersion: number },
    definitionMap: {}
) => {
    const { cookieVersion } = data;

    if (typeof cookieVersion !== 'number') {
        log.error('Could not find cookieVersion to encode');
    } else if (!definitionMap[cookieVersion]) {
        log.error(
            `Could not find definition to encode cookie version ${cookieVersion}`
        );
    } else {
        const cookieFields: Array<Field> = definitionMap[cookieVersion].fields;
        return encodeFields({ input: data, fields: cookieFields });
    }
};

/**
 * Take all fields required to encode the cookie and produce the
 * URL safe Base64 encoded value.
 */
const encodeCookieValue = (
    data: { cookieVersion: number },
    definitionMap: {}
): ?string => {
    const binaryValue = encodeDataToBits(data, definitionMap);
    // flowlint sketchy-null-string:warn
    if (binaryValue) {
        // Pad length to multiple of 8
        const paddedBinaryValue = padRight(
            binaryValue,
            7 - ((binaryValue.length + 7) % 8)
        );
        // Encode to bytes
        let bytes = '';
        for (let i = 0; i < paddedBinaryValue.length; i += 8) {
            bytes += String.fromCharCode(
                parseInt(paddedBinaryValue.substr(i, 8), 2)
            );
        }
        // Make base64 string URL friendly
        return btoa(bytes)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
};

type DefinitionMap = {
    [number]: {
        fields: Array<Field>,
    },
};

const decodeCookieBitValue = (
    bitString: string,
    definitionMap: DefinitionMap
) => {
    const cookieVersion = decodeBitsToInt(bitString, 0, NUM_BITS_VERSION);
    if (typeof cookieVersion !== 'number') {
        log.error('Could not find cookieVersion to decode');
        return {};
    } else if (!definitionMap[cookieVersion]) {
        log.error(
            `Could not find definition to decode cookie version ${cookieVersion}`
        );
        return {};
    }
    const cookieFields: Array<Field> = definitionMap[cookieVersion].fields;

    const { decodedObject } = decodeFields({
        input: bitString,
        fields: cookieFields,
    });
    return decodedObject;
};

/**
 * Decode the (URL safe Base64) value of a cookie into an object.
 */
const decodeCookieValue = (cookieValue: string, definitionMap: {}) => {
    // Replace safe characters
    const unsafe =
        cookieValue.replace(/-/g, '+').replace(/_/g, '/') +
        '=='.substring(0, (3 * cookieValue.length) % 4);

    const bytes = atob(unsafe);

    let inputBits = '';
    for (let i = 0; i < bytes.length; i += 1) {
        const bitString = bytes.charCodeAt(i).toString(2);
        inputBits += padLeft(bitString, 8 - bitString.length);
    }
    return decodeCookieBitValue(inputBits, definitionMap);
};

export { padRight, encodeCookieValue, decodeCookieValue };

export const _ = {
    padLeft,
    encodeField,
    encodeDataToBits,
    encodeIntToBits,
    encodeBoolToBits,
    encodeDateToBits,
    encode6BitCharacters,
    decodeBitsToInt,
    decodeBitsToDate,
    decodeBitsToBool,
    decodeCookieBitValue,
    decode6BitCharacters,
};
