import type { CountryCode } from '@guardian/libs';
import {
	_,
	isInAuOrNz,
	isInAustralia,
	isInCanada,
	isInNewZealand,
	isInRow,
	isInUk,
	isInUsa,
	isInUsOrCa,
} from 'common/modules/commercial/geo-utils';

let mockCountryCode: CountryCode;
jest.mock('../../../../lib/geolocation', () => ({
	getCountryCode: jest.fn(() => mockCountryCode),
}));

describe('Geolocation Utils', () => {
	beforeEach(() => {
		_.resetModule();
	});

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
			fnName: 'isInUsa() and isInUsOrCa()',
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
			fnName: 'isInCanada() and isInUsOrCa()',
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
			fnName: 'isInAustralia() and isInAuOrNz()',
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
			fnName: 'isInNewZealand() and isInAuOrNz()',
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
			fnName: 'isInRow()',
			mockCountryCode: 'FR',
			expectedUKValue: false,
			expectedUsaValue: false,
			expectedCaValue: false,
			expectedAuValue: false,
			expectedNzValue: false,
			expectedUsOrCaValue: false,
			expectedAuOrNzValue: false,
			expectedRowValue: true,
		},
	] as const;

	testCases.forEach((testCase) => {
		it(`Only ${testCase.fnName} return true for geolocation '${testCase.mockCountryCode}'`, () => {
			mockCountryCode = testCase.mockCountryCode;
			expect(isInUk()).toBe(testCase.expectedUKValue);
			expect(isInUsa()).toBe(testCase.expectedUsaValue);
			expect(isInCanada()).toBe(testCase.expectedCaValue);
			expect(isInAustralia()).toBe(testCase.expectedAuValue);
			expect(isInNewZealand()).toBe(testCase.expectedNzValue);
			expect(isInUsOrCa()).toBe(testCase.expectedUsOrCaValue);
			expect(isInAuOrNz()).toBe(testCase.expectedAuOrNzValue);
			expect(isInRow()).toBe(testCase.expectedRowValue);
		});
	});
});
