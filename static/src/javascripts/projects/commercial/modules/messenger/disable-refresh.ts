import { dfpEnv } from '../dfp/dfp-env';
import type { RegisterListener } from '../messenger';

// This message is intended to be used with a DFP creative wrapper.
// For reference, the wrapper will post a message, with an iFrameId, like so:
/*
<script>
self.addEventListener('message', function onMessage(evt) {
    var json;
    try {
        json = JSON.parse(evt.data);
    } catch(_) { return; }

    var keys = Object.keys(json);
    if( keys.length < 2 || !keys.includes('id') || !keys.includes('host') ) return;

    window.parent.postMessage(JSON.stringify({
        type: 'disable-refresh',
        value: {},
        iframeId: json.id,
        id: 'aaaa0000-bb11-cc22-dd33-eeeeee444444'
    }), '*');

    self.removeEventListener('message', onMessage);
});
</script>
*/

const findAdvert = (adSlot: HTMLElement) =>
	dfpEnv.adverts.find((advert) => advert.node.isSameNode(adSlot));

const init = (register: RegisterListener): void => {
	register('disable-refresh', (specs, ret, iframe) => {
		if (iframe) {
			const adSlot = iframe.closest('.js-ad-slot');

			if (adSlot instanceof HTMLElement) {
				const advert = findAdvert(adSlot);
				if (advert) {
					advert.shouldRefresh = false;
				}
			}
		}
	});
};

export { init };
