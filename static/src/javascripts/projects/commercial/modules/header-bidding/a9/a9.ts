import { noop } from 'lib/noop';
import config from '../../../../../lib/config';
import type { Advert } from '../../dfp/Advert';
import { dfpEnv } from '../../dfp/dfp-env';
import { getHeaderBiddingAdSlots } from '../slot-config';

/*
 * Amazon's header bidding javascript library
 * https://ams.amazon.com/webpublisher/uam/docs/web-integration-documentation/integration-guide/javascript-guide/display.html
 */

class A9AdUnit implements A9AdUnitInterface {
	slotID: string;
	slotName?: string;
	sizes: number[][];

	constructor(advert: Advert, slot: HeaderBiddingSlot) {
		this.slotID = advert.id;
		this.slotName = config.get('page.adUnit');
		this.sizes = slot.sizes.map((size) => Array.from(size));
	}
}

let initialised = false;
let requestQueue = Promise.resolve();

const bidderTimeout = 1500;

const initialise = (): void => {
	if (!initialised && window.apstag) {
		initialised = true;
		window.apstag.init({
			pubID: config.get('page.a9PublisherId'),
			adServer: 'googletag',
			bidTimeout: bidderTimeout,
		});
	}
};

// slotFlatMap allows you to dynamically interfere with the PrebidSlot definition
// for this given request for bids.
const requestBids = (
	advert: Advert,
	slotFlatMap?: SlotFlatMap,
): Promise<void> => {
	if (!initialised) {
		return requestQueue;
	}

	if (!dfpEnv.hbImpl.a9) {
		return requestQueue;
	}

	const adUnits = getHeaderBiddingAdSlots(advert, slotFlatMap).map(
		(slot) => new A9AdUnit(advert, slot),
	);

	if (adUnits.length === 0) {
		return requestQueue;
	}

	requestQueue = requestQueue
		.then(
			() =>
				new Promise<void>((resolve) => {
					window.apstag?.fetchBids({ slots: adUnits }, () => {
						window.googletag.cmd.push(() => {
							window.apstag?.setDisplayBids();
							resolve();
						});
					});
				}),
		)
		.catch(noop);

	return requestQueue;
};

export const a9 = {
	initialise,
	requestBids,
};

export const _ = {
	resetModule: (): void => {
		initialised = false;
		requestQueue = Promise.resolve();
	},
};
