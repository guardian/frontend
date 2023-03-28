/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import {
	isInUsOrCa as isInUsOrCa_,
	isInAuOrNz as isInAuOrNz_,
} from '../../../../common/modules/commercial/geo-utils';
import { _, getAppNexusDirectBidParams } from './appnexus';
import { getBreakpointKey as getBreakpointKey_ } from '../utils';
import { buildAppNexusTargetingObject } from '../../../../common/modules/commercial/build-page-targeting';

jest.mock('../../../../common/modules/commercial/build-page-targeting', () => ({
	buildAppNexusTargetingObject: jest.fn(),
}));

jest.mock('../utils', () => {
	const original = jest.requireActual('../utils');
	return {
		...original,
		getBreakpointKey: jest.fn(),
	};
});

jest.mock('../../../../common/modules/commercial/geo-utils', () => ({
	isInAuOrNz: jest.fn(),
	isInUsOrCa: jest.fn(),
}));

jest.mock('../../../../../lib/cookies', () => ({
	getCookie: jest.fn(),
}));

jest.mock('../../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(
		(testId, variantId) => variantId === 'variant',
	),
}));

const { getAppNexusInvCode, getAppNexusDirectPlacementId } = _;

const getBreakpointKey = getBreakpointKey_;
const isInAuOrNz = isInAuOrNz_;
const isInUsOrCa = isInUsOrCa_;

/* eslint-disable guardian-frontend/no-direct-access-config */
const resetConfig = () => {
	window.guardian.config.switches.prebidAppnexus = true;
	window.guardian.config.switches.prebidAppnexusInvcode = false;
	window.guardian.config.ophan = { pageViewId: 'pvid' };
	window.guardian.config.page.contentType = 'Article';
	window.guardian.config.page.section = 'Magic';
	window.guardian.config.page.sectionName = 'More Magic';
	window.guardian.config.page.edition = 'UK';
};

describe('getAppNexusInvCode', () => {
	beforeEach(() => {
		resetConfig();
	});

	afterEach(() => {
		jest.resetAllMocks();
		resetConfig();
	});

	test('should return the magic strings for mobile breakpoints', () => {
		getBreakpointKey.mockReturnValue('M');
		const invCodes = [
			[[300, 250]],
			[[300, 600]],
			[[970, 250]],
			[[728, 90]],
		].map(getAppNexusInvCode);

		expect(invCodes).toEqual([
			'Mmagic300x250',
			'Mmagic300x600',
			'Mmagic970x250',
			'Mmagic728x90',
		]);
	});

	test('should return the magic strings for other breakpoints', () => {
		getBreakpointKey.mockReturnValueOnce('T');
		getBreakpointKey.mockReturnValueOnce('D');
		const invCodes = [
			[[300, 250]],
			[[300, 600]],
			[[970, 250]],
			[[728, 90]],
		].map(getAppNexusInvCode);
		expect(invCodes).toEqual([
			'Dmagic300x250',
			'Dmagic300x600',
			'Dmagic970x250',
			'Dmagic728x90',
		]);
	});

	test('should use sectionName, replacing whitespace with hyphens, when section is an empty string', () => {
		window.guardian.config.page.section = '';
		expect(getAppNexusInvCode([[300, 250]])).toEqual('Dmore-magic300x250');
	});
});

describe('getAppNexusDirectPlacementId', () => {
	beforeEach(() => {
		resetConfig();
	});

	afterEach(() => {
		jest.resetAllMocks();
		resetConfig();
	});

	const prebidSizes = [
		[[300, 250]],
		[[300, 600]],
		[[970, 250]],
		[[728, 90]],
		[[1, 2]],
	];

	test('should return the expected values when in AU region and desktop device', () => {
		isInAuOrNz.mockReturnValue(true);
		expect(
			prebidSizes.map((size) => getAppNexusDirectPlacementId(size)),
		).toEqual(['11016434', '11016434', '11016434', '11016434', '11016434']);
	});

	test('should return the expected values for ROW when on desktop device', () => {
		isInAuOrNz.mockReturnValue(false);
		getBreakpointKey.mockReturnValue('D');
		expect(
			prebidSizes.map((size) => getAppNexusDirectPlacementId(size)),
		).toEqual(['9251752', '9251752', '9926678', '9926678', '9251752']);
	});

	test('should return the expected values for ROW when on tablet device', () => {
		getBreakpointKey.mockReturnValue('T');
		isInAuOrNz.mockReturnValue(false);
		expect(
			prebidSizes.map((size) => getAppNexusDirectPlacementId(size)),
		).toEqual(['4371641', '9251752', '9251752', '4371640', '9251752']);
	});
});

describe('getAppNexusDirectBidParams', () => {
	beforeEach(() => {
		resetConfig();
		buildAppNexusTargetingObject.mockReturnValue({
			edition: 'UK',
			sens: 'f',
			url: 'gu.com',
		});
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	test('should include placementId for AU region when invCode switch is off', () => {
		getBreakpointKey.mockReturnValue('M');
		isInAuOrNz.mockReturnValue(true);
		const pageTargeting = {};

		expect(getAppNexusDirectBidParams([[300, 250]], pageTargeting)).toEqual(
			{
				keywords: { edition: 'UK', sens: 'f', url: 'gu.com' },
				placementId: '11016434',
			},
		);
		expect(buildAppNexusTargetingObject).toHaveBeenCalledTimes(1);
		expect(buildAppNexusTargetingObject).toHaveBeenCalledWith(
			pageTargeting,
		);
	});

	test('should exclude placementId for AU region when including member and invCode', () => {
		window.guardian.config.switches.prebidAppnexusInvcode = true;
		getBreakpointKey.mockReturnValue('M');
		isInAuOrNz.mockReturnValueOnce(true);
		const pageTargeting = {};

		expect(getAppNexusDirectBidParams([[300, 250]], pageTargeting)).toEqual(
			{
				keywords: {
					edition: 'UK',
					sens: 'f',
					url: 'gu.com',
					invc: ['Mmagic300x250'],
				},
				member: '7012',
				invCode: 'Mmagic300x250',
			},
		);

		expect(buildAppNexusTargetingObject).toHaveBeenCalledTimes(1);
		expect(buildAppNexusTargetingObject).toHaveBeenCalledWith(
			pageTargeting,
		);
	});

	test('should include placementId and not include invCode if outside AU region', () => {
		window.guardian.config.switches.prebidAppnexusInvcode = true;
		getBreakpointKey.mockReturnValue('M');
		const pageTargeting = {};

		expect(getAppNexusDirectBidParams([[300, 250]], pageTargeting)).toEqual(
			{
				keywords: { edition: 'UK', sens: 'f', url: 'gu.com' },
				placementId: '4298191',
			},
		);

		expect(buildAppNexusTargetingObject).toHaveBeenCalledTimes(1);
		expect(buildAppNexusTargetingObject).toHaveBeenCalledWith(
			pageTargeting,
		);
	});
});
