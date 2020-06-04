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
