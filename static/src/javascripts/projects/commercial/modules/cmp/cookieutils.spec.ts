
import { _, decodeCookieValue, encodeCookieValue } from "./cookieutils";
import { vendorVersionMap } from "./cmp-env";

const {
  encodeIntToBits,
  encodeBoolToBits,
  encodeDateToBits,
  encode6BitCharacters,
  decodeBitsToInt,
  decodeBitsToDate,
  decodeBitsToBool,
  decode6BitCharacters,
  decodeCookieBitValue
} = _;

jest.mock('commercial/modules/cmp/log', () => ({
  log: {
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

jest.mock('lib/config', () => ({
  switches: {
    personalisedAds: true
  }
}));

describe('cookieutils', () => {
  it('encodeIntToBits encodes an integer to a bit string', () => {
    const bitString = encodeIntToBits(123);
    expect(bitString).toBe('1111011');
  });
  it('encodeIntToBits encodes an integer to a bit string with padding', () => {
    const bitString = encodeIntToBits(123, 12);
    expect(bitString).toBe('000001111011');
  });

  it('encodeBoolToBits encodes a "true" boolean to a bit string', () => {
    const bitString = encodeBoolToBits(true);
    expect(bitString).toBe('1');
  });
  it('encodeBoolToBits encodes a "false" boolean to a bit string', () => {
    const bitString = encodeBoolToBits(false);
    expect(bitString).toBe('0');
  });

  it('encodeDateToBits encodes a date to a bit string', () => {
    const date = new Date(1512661975200);
    // $FlowFixMe I know arguments are missing, Flow... this is a test
    const bitString = encodeDateToBits(date);
    expect(bitString).toBe('1110000101100111011110011001101000');
  });
  it('encodeDateToBits encodes a date to a bit string with padding', () => {
    const date = new Date(1512661975200);
    const bitString = encodeDateToBits(date, 36);
    expect(bitString).toBe('001110000101100111011110011001101000');
  });

  it('encode6BitCharacters encodes a 6bitchar string to a bit string', () => {
    // $FlowFixMe I know arguments are missing, Flow... this is a test
    const bitString = encode6BitCharacters('hello');
    expect(bitString).toBe('000111000100001011001011001110');
  });

  it('decodeBitsToInt decodes a bit string to original encoded value', () => {
    const bitString = encodeIntToBits(123);
    const decoded = decodeBitsToInt(bitString, 0, bitString.length);
    expect(decoded).toBe(123);
  });

  it('decodeBitsToDate decodes a bit string to original encoded value', () => {
    const now = new Date('2018-07-15 PDT');
    // $FlowFixMe I know arguments are missing, Flow... this is a test
    const bitString = encodeDateToBits(now);
    const decoded = decodeBitsToDate(bitString, 0, bitString.length);
    expect(decoded.getTime()).toBe(now.getTime());
  });

  it('decodeBitsToBool decodes a bit string to original encoded "true" value', () => {
    const bitString = encodeBoolToBits(true);
    const decoded = decodeBitsToBool(bitString, 0);
    expect(decoded).toEqual(true);
  });
  it('decodeBitsToBool decodes a bit string to original encoded "false" value', () => {
    const bitString = encodeBoolToBits(false);
    const decoded = decodeBitsToBool(bitString, 0);
    expect(decoded).toEqual(false);
  });

  it('decode6BitCharacters decodes a bit string to original encoded value', () => {
    const string = 'STUFF';
    // $FlowFixMe I know arguments are missing, Flow... this is a test
    const bitString = encode6BitCharacters(string);
    const decoded = decode6BitCharacters(bitString, 0, bitString.length);
    expect(decoded).toEqual(string);
  });
  it('decode6BitCharacters decodes a bit string that is longer than length', () => {
    const string = 'STUFF';
    // $FlowFixMe I know arguments are missing, Flow... this is a test
    const bitString = encode6BitCharacters(string);
    const decoded = decode6BitCharacters(bitString, 0, 12);
    expect(decoded).toBe('ST');
  });

  it('decodes a cookie bit value', () => {
    const inputValue = '0000010000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000010000010001000011010000000000011100000000000000000000000000000000000110011010000000';

    const expected = JSON.stringify({
      cookieVersion: 1,
      created: '1970-01-01T00:00:00.000Z',
      lastUpdated: '1970-01-01T00:00:00.000Z',
      cmpId: 1,
      cmpVersion: 1,
      consentScreen: 1,
      consentLanguage: 'EN',
      vendorListVersion: 1,
      purposeIdBitString: '110000000000000000000000',
      maxVendorId: 6,
      isRange: false,
      vendorIdBitString: '110100'
    });
    const decoded = JSON.stringify(decodeCookieBitValue(inputValue, vendorVersionMap));
    expect(decoded).toEqual(expected);
  });

  it('encodes a vendor cookie object to the expected base64 string', () => {
    const encodedString = encodeCookieValue({
      cookieVersion: 1,
      created: '1970-01-01T00:00:00.000Z',
      lastUpdated: '1970-01-01T00:00:00.000Z',
      cmpId: 1,
      cmpVersion: 1,
      consentScreen: 1,
      consentLanguage: 'EN',
      vendorListVersion: 1,
      purposeIdBitString: '110000000000000000000000',
      maxVendorId: 6,
      isRange: false,
      vendorIdBitString: '110100'
    }, vendorVersionMap);
    expect(encodedString).toBe('BAAAAAAAAAAAAABABBENABwAAAAAZoA');
  });

  it('decodes a vendor cookie object from a valid base64 string', () => {
    const result = JSON.stringify(decodeCookieValue('BAAAAAAAAAAAAABABBENABwAAAAAZoA', vendorVersionMap));
    const expected = JSON.stringify({
      cookieVersion: 1,
      created: '1970-01-01T00:00:00.000Z',
      lastUpdated: '1970-01-01T00:00:00.000Z',
      cmpId: 1,
      cmpVersion: 1,
      consentScreen: 1,
      consentLanguage: 'EN',
      vendorListVersion: 1,
      purposeIdBitString: '110000000000000000000000',
      maxVendorId: 6,
      isRange: false,
      vendorIdBitString: '110100'
    });

    expect(result).toEqual(expected);
  });
});