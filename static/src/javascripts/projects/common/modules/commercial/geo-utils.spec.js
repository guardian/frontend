// @flow
import {isInUk,
    isInUsa,
    isInCanada,
    isInAustralia,
    isInNewZealand,
    isInUsOrCa,
    isInAuOrNz,
    isInRow,
    _} from "common/modules/commercial/geo-utils";

let mockCountryCode;
jest.mock('lib/geolocation', () => ({
    getSync: jest.fn(() => mockCountryCode),
}));

describe('Geolocation Utils', () => {
    beforeEach(() => {
        _.resetModule();
    })

    const testCases = [
        {
            fnName: 'isInUk()',
            mockCountryCode: 'GB',
            expectedUKValue: true,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: false,
            expectedRowValue: false,
        },
        {
            fnName: 'isInUk()',
            mockCountryCode: 'NON-GB',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: false,
            expectedRowValue: true,
        },
        {
            fnName: 'isInUsa()',
            mockCountryCode: 'US',
            expectedUKValue: false,
            expectedUsaValue: true,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: true,
            expectedAuOrNzValue: false,
            expectedRowValue: false,
        },
        {
            fnName: 'isInUsa()',
            mockCountryCode: 'NON-US',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: false,
            expectedRowValue: true,
        },
        {
            fnName: 'isInCanada()',
            mockCountryCode: 'CA',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: true,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: true,
            expectedAuOrNzValue: false,
            expectedRowValue: false,
        },
        {
            fnName: 'isInCanada()',
            mockCountryCode: 'NON-CA',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: false,
            expectedRowValue: true,
        },
        {
            fnName: 'isInAustralia()',
            mockCountryCode: 'AU',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: true,
            expectedNzValue: false,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: true,
            expectedRowValue: false,
        },
        {
            fnName: 'isInAustralia()',
            mockCountryCode: 'NON-AU',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: false,
            expectedRowValue: true,
        },
        {
            fnName: 'isInNewZealand()',
            mockCountryCode: 'NZ',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: true,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: true,
            expectedRowValue: false,
        },
        {
            fnName: 'isInNewZealand()',
            mockCountryCode: 'NON-NZS',
            expectedUKValue: false,
            expectedUsaValue: false,
            expectedCaValue: false,
            expectedAuValue: false,
            expectedNzValue: false,
            expectedUsOrCaValue: false,
            expectedAuOrNzValue: false,
            expectedRowValue: true,
        }
    ]

    testCases.forEach( testCase => {
        it(`${testCase.fnName} returns true if geolocation is ${testCase.mockCountryCode}`, () => {
            mockCountryCode = testCase.mockCountryCode;
            expect(isInUk()).toBe(testCase.expectedUKValue);
            expect(isInUsa()).toBe(testCase.expectedUsaValue);
            expect(isInCanada()).toBe(testCase.expectedCaValue);
            expect(isInAustralia()).toBe(testCase.expectedAuValue);
            expect(isInNewZealand()).toBe(testCase.expectedNzValue);
            expect(isInUsOrCa()).toBe(testCase.expectedUsOrCaValue);
            expect(isInAuOrNz()).toBe(testCase.expectedAuOrNzValue);
            expect(isInRow()).toBe(testCase.expectedRowValue);
        })
    })
})
