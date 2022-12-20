import { createAdSize } from '@guardian/commercial-core';
import type { PageTargeting } from '@guardian/commercial-core';
import {
	isInAuOrNz as isInAuOrNz_,
	isInRow as isInRow_,
	isInUk as isInUk_,
	isInUsOrCa as isInUsOrCa_,
} from 'common/modules/commercial/geo-utils';
import config from '../../../../../lib/config';
import { isInVariantSynchronous as isInVariantSynchronous_ } from '../../../../common/modules/experiments/ab';
import {
	containsBillboard as containsBillboard_,
	containsDmpu as containsDmpu_,
	containsLeaderboard as containsLeaderboard_,
	containsLeaderboardOrBillboard as containsLeaderboardOrBillboard_,
	containsMobileSticky as containsMobileSticky_,
	containsMpu as containsMpu_,
	containsMpuOrDmpu as containsMpuOrDmpu_,
	getBreakpointKey as getBreakpointKey_,
	shouldIncludeAdYouLike as shouldIncludeAdYouLike_,
	shouldIncludeAppNexus as shouldIncludeAppNexus_,
	shouldIncludeCriteo as shouldIncludeCriteo_,
	shouldIncludeImproveDigital as shouldIncludeImproveDigital_,
	shouldIncludeOpenx as shouldIncludeOpenx_,
	shouldIncludeSonobi as shouldIncludeSonobi_,
	shouldIncludeTripleLift as shouldIncludeTripleLift_,
	shouldIncludeTrustX as shouldIncludeTrustX_,
	shouldIncludeXaxis as shouldIncludeXaxis_,
	stripMobileSuffix as stripMobileSuffix_,
} from '../utils';
import { _, bids } from './bid-config';

const mockPageTargeting = {} as unknown as PageTargeting;

const getBidders = () =>
	bids(
		'dfp-ad--top-above-nav',
		[createAdSize(728, 90)],
		mockPageTargeting,
	).map((bid) => bid.bidder);

const {
	getIndexSiteId,
	getImprovePlacementId,
	getImproveSkinPlacementId,
	getXaxisPlacementId,
	getTrustXAdUnitId,
	indexExchangeBidders,
} = _;

jest.mock('../../../../common/modules/commercial/build-page-targeting', () => ({
	buildAppNexusTargeting: () => 'someTestAppNexusTargeting',
	buildAppNexusTargetingObject: () => 'someAppNexusTargetingObject',
	getPageTargeting: () => 'bla',
}));

jest.mock('lib/raven');

jest.mock('../utils');
const containsBillboard = containsBillboard_ as jest.Mock;
const containsDmpu = containsDmpu_ as jest.Mock;
const containsLeaderboard = containsLeaderboard_ as jest.Mock;
const containsLeaderboardOrBillboard =
	containsLeaderboardOrBillboard_ as jest.Mock;
const containsMobileSticky = containsMobileSticky_ as jest.Mock;
const containsMpu = containsMpu_ as jest.Mock;
const containsMpuOrDmpu = containsMpuOrDmpu_ as jest.Mock;
const shouldIncludeAdYouLike = shouldIncludeAdYouLike_ as jest.Mock;
const shouldIncludeAppNexus = shouldIncludeAppNexus_ as jest.Mock;
const shouldIncludeImproveDigital = shouldIncludeImproveDigital_ as jest.Mock;
const shouldIncludeOpenx = shouldIncludeOpenx_ as jest.Mock;
const shouldIncludeTrustX = shouldIncludeTrustX_ as jest.Mock;
const shouldIncludeXaxis = shouldIncludeXaxis_ as jest.Mock;
const shouldIncludeSonobi = shouldIncludeSonobi_ as jest.Mock;
const shouldIncludeTripleLift = shouldIncludeTripleLift_ as jest.Mock;
const shouldIncludeCriteo = shouldIncludeCriteo_ as jest.Mock;
const stripMobileSuffix = stripMobileSuffix_ as jest.Mock;
const getBreakpointKey = getBreakpointKey_ as jest.Mock;
const isInVariantSynchronous = isInVariantSynchronous_ as jest.Mock;

jest.mock('../../../../common/modules/commercial/geo-utils');
const isInAuOrNz = isInAuOrNz_ as jest.Mock;
const isInRow = isInRow_ as jest.Mock;
const isInUk = isInUk_ as jest.Mock;
const isInUsOrCa = isInUsOrCa_ as jest.Mock;

jest.mock('../../../../common/modules/experiments/ab', () => ({
	isInVariantSynchronous: jest.fn(),
}));

jest.mock('../../../../../lib/cookies', () => ({
	getCookie: jest.fn(),
}));

const resetConfig = () => {
	window.guardian.ophan = {
		pageViewId: 'pvid',
		viewId: 'v_id',
		record: () => {
			// do nothing;
		},
		setEventEmitter: null,
		trackComponentAttention: null,
	};
	window.guardian.config.switches = {
		prebidAppnexus: true,
		prebidAppnexusInvcode: true,
		prebidOpenx: true,
		prebidImproveDigital: true,
		prebidIndexExchange: true,
		prebidSonobi: true,
		prebidTrustx: true,
		prebidXaxis: true,
		prebidAdYouLike: true,
		prebidTriplelift: true,
		prebidCriteo: true,
	};
	window.guardian.config.page.contentType = 'Article';
	window.guardian.config.page.section = 'Magic';
	window.guardian.config.page.isDev = false;
};

describe('getImprovePlacementId', () => {
	beforeEach(() => {
		resetConfig();
		getBreakpointKey.mockReturnValue('D');
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	const generateTestIds = () => {
		const prebidSizes: HeaderBiddingSize[][] = [
			[createAdSize(300, 250)],
			[createAdSize(300, 600)],
			[createAdSize(970, 250)],
			[createAdSize(728, 90)],
			[createAdSize(1, 2)],
		];
		return prebidSizes.map(getImprovePlacementId);
	};

	test('should return -1 if no cases match', () => {
		expect(getImprovePlacementId([createAdSize(1, 2)])).toBe(-1);
	});

	test('should return the expected values when geolocated in UK and on desktop device', () => {
		isInUk.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('D');
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValue(false);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValue(false);
		expect(generateTestIds()).toEqual([
			1116396, 1116396, 1116397, 1116397, -1,
		]);
	});

	test('should return the expected values when geolocated in UK and on tablet device', () => {
		isInUk.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('T');
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValue(false);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValue(false);
		expect(generateTestIds()).toEqual([
			1116398, 1116398, 1116399, 1116399, -1,
		]);
	});

	test('should return the expected values when geolocated in UK and on mobile device', () => {
		isInUk.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('M');
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValue(false);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValue(false);
		expect(generateTestIds()).toEqual([1116400, 1116400, -1, -1, -1]);
	});

	test('should return the expected values when geolocated in ROW region and on desktop device', () => {
		isInRow.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('D');
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValue(false);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValue(false);
		expect(generateTestIds()).toEqual([
			1116420, 1116420, 1116421, 1116421, -1,
		]);
	});

	test('should return the expected values when not geolocated in ROW region and on tablet device', () => {
		isInRow.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('T');
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValue(false);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValueOnce(true);
		containsLeaderboardOrBillboard.mockReturnValue(false);
		expect(generateTestIds()).toEqual([
			1116422, 1116422, 1116423, 1116423, -1,
		]);
	});

	test('should return the expected values when geolocated in ROW region and on mobile device', () => {
		isInRow.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('M');
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValueOnce(true);
		containsMpuOrDmpu.mockReturnValue(false);
		expect(generateTestIds()).toEqual([1116424, 1116424, -1, -1, -1]);
	});

	test('should return -1 if geolocated in US or AU regions', () => {
		isInUsOrCa.mockReturnValue(true);
		expect(generateTestIds()).toEqual([-1, -1, -1, -1, -1]);
		isInAuOrNz.mockReturnValue(true);
		expect(generateTestIds()).toEqual([-1, -1, -1, -1, -1]);
	});
});

describe('getImproveSkinPlacementId', () => {
	beforeEach(() => {
		resetConfig();
		getBreakpointKey.mockReturnValue('D');
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	const ID_UK = 22526482;
	const ID_ROW = 22526483;

	test(`should return ${ID_UK} if in the UK`, () => {
		isInUk.mockReturnValue(true);
		expect(getImproveSkinPlacementId()).toBe(ID_UK);
	});

	test(`should return ${ID_UK} when geolocated in UK and on desktop device`, () => {
		isInUk.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('D');
		expect(getImproveSkinPlacementId()).toEqual(ID_UK);
	});

	test('should return -1 when geolocated in UK and on tablet device', () => {
		isInUk.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('T');
		expect(getImproveSkinPlacementId()).toEqual(-1);
	});

	test('should return -1 values when geolocated in UK and on mobile device', () => {
		isInUk.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('M');
		expect(getImproveSkinPlacementId()).toEqual(-1);
	});

	test(`should return ${ID_ROW} when geolocated in ROW region and on desktop device`, () => {
		isInRow.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('D');
		expect(getImproveSkinPlacementId()).toEqual(ID_ROW);
	});

	test('should return -1 when not geolocated in ROW region and on tablet device', () => {
		isInRow.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('T');
		expect(getImproveSkinPlacementId()).toEqual(-1);
	});

	test('should return -1 when geolocated in ROW region and on mobile device', () => {
		isInRow.mockReturnValue(true);
		getBreakpointKey.mockReturnValue('M');
		expect(getImproveSkinPlacementId()).toEqual(-1);
	});

	test('should return -1 if geolocated in US or AU regions', () => {
		isInUsOrCa.mockReturnValue(true);
		expect(getImproveSkinPlacementId()).toEqual(-1);
		isInAuOrNz.mockReturnValue(true);
		expect(getImproveSkinPlacementId()).toEqual(-1);
	});
});

describe('getTrustXAdUnitId', () => {
	beforeEach(() => {
		getBreakpointKey.mockReturnValue('D');
		stripMobileSuffix.mockImplementation((str: string) => str);
	});

	afterEach(() => {
		jest.resetAllMocks();
		resetConfig();
	});

	test('should return the expected value for dfp-ad--comments', () => {
		expect(getTrustXAdUnitId('dfp-ad--comments', true)).toBe('3840');
	});

	test('should return the expected values for dfp-ad--inline10', () => {
		expect(getTrustXAdUnitId('dfp-ad--inline10', true)).toBe('3840');
		expect(getTrustXAdUnitId('dfp-ad--inline10', false)).toBe('3841');
	});

	test('should return the expected values for dfp-ad--mobile-sticky', () => {
		expect(getTrustXAdUnitId('dfp-ad--mobile-sticky', true)).toBe('8519');
	});
});

describe('indexExchangeBidders', () => {
	beforeEach(() => {
		resetConfig();
		getBreakpointKey.mockReturnValue('D');
		config.set('page.pbIndexSites', [
			{ bp: 'D', id: 123456 },
			{ bp: 'M', id: 234567 },
			{ bp: 'T', id: 345678 },
		]);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	test('should return an IX bidder for every size that the slot can take', () => {
		const slotSizes: HeaderBiddingSize[] = [
			createAdSize(300, 250),
			createAdSize(300, 600),
		];
		const bidders: PrebidBidder[] = indexExchangeBidders(slotSizes);
		expect(bidders).toEqual([
			expect.objectContaining<Partial<PrebidBidder>>({
				name: 'ix',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- it actually works
				bidParams: expect.any(Function),
			}),
			expect.objectContaining({
				name: 'ix',
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- it works
				bidParams: expect.any(Function),
			}),
		]);
	});

	test('should include methods in the response that generate the correct bid params', () => {
		const slotSizes: HeaderBiddingSize[] = [
			createAdSize(300, 250),
			createAdSize(300, 600),
		];
		const bidders: PrebidBidder[] = indexExchangeBidders(slotSizes);
		expect(bidders[0].bidParams('type', [createAdSize(1, 2)])).toEqual({
			siteId: '123456',
			size: [300, 250],
		});
		expect(bidders[1].bidParams('type', [createAdSize(1, 2)])).toEqual({
			siteId: '123456',
			size: [300, 600],
		});
	});
});

describe('getIndexSiteId', () => {
	afterEach(() => {
		jest.resetAllMocks();
		resetConfig();
	});

	test('should return an empty string if pbIndexSites is empty', () => {
		window.guardian.config.page.pbIndexSites = [];
		getBreakpointKey.mockReturnValue('D');
		expect(getIndexSiteId()).toBe('');
		expect(getIndexSiteId().length).toBe(0);
	});

	test('should find the correct ID for the breakpoint', () => {
		config.set('page.pbIndexSites', [
			{ bp: 'D', id: 123456 },
			{ bp: 'M', id: 234567 },
			{ bp: 'T', id: 345678 },
		]);
		const breakpoints = ['M', 'D', 'M', 'T', 'D'];
		const results = [];
		for (let i = 0; i < breakpoints.length; i += 1) {
			getBreakpointKey.mockReturnValue(breakpoints[i]);
			results.push(getIndexSiteId());
		}
		expect(results).toEqual([
			'234567',
			'123456',
			'234567',
			'345678',
			'123456',
		]);
	});
});

describe('bids', () => {
	beforeEach(() => {
		resetConfig();
		containsBillboard.mockReturnValue(false);
		containsDmpu.mockReturnValue(false);
		containsLeaderboard.mockReturnValue(false);
		containsLeaderboardOrBillboard.mockReturnValue(false);
		containsMpu.mockReturnValue(false);
		containsMpuOrDmpu.mockReturnValue(false);
		shouldIncludeAdYouLike.mockReturnValue(true);
		shouldIncludeAppNexus.mockReturnValue(false);
		shouldIncludeTrustX.mockReturnValue(false);
		stripMobileSuffix.mockImplementation((str: string) => str);
	});

	afterEach(() => {
		jest.resetAllMocks();
		jsdom.reconfigure({
			url: 'https://some.domain/path',
		});
	});

	const setQueryString = (s: string) => {
		jsdom.reconfigure({
			url: `https://some.domain/path?${s}`,
		});
	};

	test('should only include bidders that are switched on if no bidders being tested', () => {
		window.guardian.config.switches.prebidXaxis = false;
		shouldIncludeImproveDigital.mockReturnValueOnce(true);
		expect(getBidders()).toEqual(['ix', 'improvedigital', 'adyoulike']);
	});

	test('should not include ix bidders when switched off', () => {
		window.guardian.config.switches.prebidIndexExchange = false;
		expect(getBidders()).toEqual(['adyoulike']);
	});

	test('should include Sonobi if in target geolocation', () => {
		shouldIncludeSonobi.mockReturnValue(true);
		expect(getBidders()).toEqual(['ix', 'sonobi', 'adyoulike']);
	});

	test('should include AppNexus directly if in target geolocation', () => {
		shouldIncludeAppNexus.mockReturnValue(true);
		expect(getBidders()).toEqual(['ix', 'and', 'adyoulike']);
	});

	test('should include OpenX directly if in target geolocation', () => {
		shouldIncludeOpenx.mockReturnValue(true);
		expect(getBidders()).toEqual(['ix', 'adyoulike', 'oxd']);
	});

	test('should include TrustX if in target geolocation', () => {
		shouldIncludeTrustX.mockReturnValue(true);
		expect(getBidders()).toEqual(['ix', 'trustx', 'adyoulike']);
	});

	test('should include Criteo if in target geolocation', () => {
		shouldIncludeCriteo.mockReturnValue(true);
		expect(getBidders()).toEqual(['ix', 'criteo', 'adyoulike']);
	});

	test('should include ix bidder for each size that slot can take', () => {
		const rightSlotBidders = () =>
			bids(
				'dfp-right',
				[createAdSize(300, 600), createAdSize(300, 250)],
				mockPageTargeting,
			).map((bid) => bid.bidder);
		expect(rightSlotBidders()).toEqual(['ix', 'ix', 'adyoulike']);
	});

	test('should only include bidder being tested', () => {
		setQueryString('pbtest=xhb');
		expect(getBidders()).toEqual(['xhb']);
	});

	test('should only include bidder being tested, even when its switch is off', () => {
		setQueryString('pbtest=xhb');
		window.guardian.config.switches.prebidXaxis = false;
		expect(getBidders()).toEqual(['xhb']);
	});

	test('should only include bidder being tested, even when it should not be included', () => {
		setQueryString('pbtest=xhb');
		shouldIncludeXaxis.mockReturnValue(false);
		expect(getBidders()).toEqual(['xhb']);
	});

	test('should only include multiple bidders being tested, even when their switches are off', () => {
		setQueryString('pbtest=xhb&pbtest=sonobi');
		isInVariantSynchronous.mockImplementation(
			(testId, variantId) => variantId === 'variant',
		);
		window.guardian.config.switches.prebidXaxis = false;
		window.guardian.config.switches.prebidSonobi = false;
		expect(getBidders()).toEqual(['sonobi', 'xhb']);
	});

	test('should ignore bidder that does not exist', () => {
		setQueryString('pbtest=nonexistentbidder&pbtest=xhb');
		expect(getBidders()).toEqual(['xhb']);
	});

	test('should use correct parameters in OpenX bids geolocated in UK', () => {
		shouldIncludeOpenx.mockReturnValue(true);
		isInUk.mockReturnValue(true);
		const openXBid = bids(
			'dfp-ad--top-above-nav',
			[createAdSize(728, 90)],
			mockPageTargeting,
		)[2];
		expect(openXBid.params).toEqual({
			customParams: 'someAppNexusTargetingObject',
			delDomain: 'guardian-d.openx.net',
			unit: '540279541',
		});
	});

	test('should use correct parameters in OpenX bids geolocated in US', () => {
		shouldIncludeOpenx.mockReturnValue(true);
		isInUsOrCa.mockReturnValue(true);
		const openXBid = bids(
			'dfp-ad--top-above-nav',
			[createAdSize(728, 90)],
			mockPageTargeting,
		)[2];
		expect(openXBid.params).toEqual({
			customParams: 'someAppNexusTargetingObject',
			delDomain: 'guardian-us-d.openx.net',
			unit: '540279544',
		});
	});

	test('should use correct parameters in OpenX bids geolocated in AU', () => {
		shouldIncludeOpenx.mockReturnValue(true);
		isInAuOrNz.mockReturnValue(true);
		const openXBid = bids(
			'dfp-ad--top-above-nav',
			[createAdSize(728, 90)],
			mockPageTargeting,
		)[2];
		expect(openXBid.params).toEqual({
			customParams: 'someAppNexusTargetingObject',
			delDomain: 'guardian-aus-d.openx.net',
			unit: '540279542',
		});
	});

	test('should use correct parameters in OpenX bids geolocated in FR', () => {
		shouldIncludeOpenx.mockReturnValue(true);
		isInRow.mockReturnValue(true);
		const openXBid = bids(
			'dfp-ad--top-above-nav',
			[createAdSize(728, 90)],
			mockPageTargeting,
		)[2];
		expect(openXBid.params).toEqual({
			customParams: 'someAppNexusTargetingObject',
			delDomain: 'guardian-d.openx.net',
			unit: '540279541',
		});
	});
});

describe('triplelift adapter', () => {
	beforeEach(() => {
		resetConfig();
		window.guardian.config.page.contentType = 'Article';
		shouldIncludeTripleLift.mockReturnValue(true);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	test('should include triplelift adapter if condition is true ', () => {
		expect(getBidders()).toEqual(['ix', 'triplelift']);
	});

	test('should return correct triplelift adapter params for leaderboard', () => {
		containsLeaderboard.mockReturnValueOnce(true);
		containsMpu.mockReturnValueOnce(false);
		containsDmpu.mockReturnValueOnce(false);
		containsMobileSticky.mockReturnValueOnce(false);

		const tripleLiftBids = bids(
			'dfp-ad--top-above-nav',
			[createAdSize(728, 90)],
			mockPageTargeting,
		)[1].params;
		expect(tripleLiftBids).toEqual({
			inventoryCode: 'theguardian_topbanner_728x90_prebid',
		});
	});

	test('should return correct triplelift adapter params for mbu', () => {
		containsLeaderboard.mockReturnValueOnce(false);
		containsMpu.mockReturnValueOnce(true);
		containsDmpu.mockReturnValueOnce(false);
		containsMobileSticky.mockReturnValueOnce(false);

		const tripleLiftBids = bids(
			'dfp-ad--inline1',
			[createAdSize(300, 250)],
			mockPageTargeting,
		)[1].params;
		expect(tripleLiftBids).toEqual({
			inventoryCode: 'theguardian_sectionfront_300x250_prebid',
		});
	});

	test('should return correct triplelift adapter params for mobile sticky', () => {
		containsLeaderboard.mockReturnValueOnce(false);
		containsMpu.mockReturnValueOnce(false);
		containsDmpu.mockReturnValueOnce(false);
		containsMobileSticky.mockReturnValueOnce(true);

		const tripleLiftBids = bids(
			'dfp-ad--top-above-nav',
			[createAdSize(320, 50)],
			mockPageTargeting,
		)[1].params;
		expect(tripleLiftBids).toEqual({
			inventoryCode: 'theguardian_320x50_HDX',
		});
	});
});

describe('getXaxisPlacementId', () => {
	beforeEach(() => {
		resetConfig();
		getBreakpointKey.mockReturnValue('D');

		containsMpuOrDmpu
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
		containsLeaderboardOrBillboard
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(true)
			.mockReturnValue(false);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	const generateTestIds = () => {
		const prebidSizes: HeaderBiddingSize[][] = [
			[createAdSize(300, 250)],
			[createAdSize(300, 600)],
			[createAdSize(970, 250)],
			[createAdSize(728, 90)],
			[createAdSize(1, 2)],
		];
		return prebidSizes.map(getXaxisPlacementId);
	};

	test('should return -1 if no cases match', () => {
		expect(getImprovePlacementId([createAdSize(1, 2)])).toBe(-1);
	});

	test('should return the expected values for desktop device', () => {
		getBreakpointKey.mockReturnValue('D');

		expect(generateTestIds()).toEqual([
			20943665, 20943665, 20943666, 20943666, 20943668,
		]);
	});

	test('should return the expected values for tablet device', () => {
		getBreakpointKey.mockReturnValue('T');
		expect(generateTestIds()).toEqual([
			20943671, 20943671, 20943672, 20943672, 20943674,
		]);
	});

	test('should return the expected values for mobile device', () => {
		getBreakpointKey.mockReturnValue('M');
		expect(generateTestIds()).toEqual([
			20943669, 20943669, 20943670, 20943670, 20943670,
		]);
	});
});
