import { postMessage } from '../messenger/post-message';
import { getAdvertById } from './get-advert-by-id';

const host = `${window.location.protocol}//${window.location.host}`;

/* This is for native ads. We send two pieces of information:
   - the ID of the iframe into which this ad is embedded. This is currently
	 the only way to link an incoming message to the iframe it is "coming from"
   - the HOST of the parent frame. Again, inside the embedded document there is
	 no way to know if we are running the site in production, dev or local mode.
	 But, this information is necessary in the window.postMessage call, and so
	 we resort to sending it as a token of welcome :)
*/
export const onSlotLoad = (event: googletag.events.SlotOnloadEvent): void => {
	const advert = getAdvertById(event.slot.getSlotElementId());
	if (!advert) {
		return;
	}

	const iframe = advert.node.getElementsByTagName('iframe').item(0);
	if (!iframe?.contentWindow) {
		console.log('No iFrame found for slot', advert.id, advert.slot);
		return;
	}
	postMessage(
		{
			id: iframe.id,
			host,
		},
		iframe.contentWindow,
	);
};
