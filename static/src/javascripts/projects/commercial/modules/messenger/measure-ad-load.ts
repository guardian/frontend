import { EventTimer } from '@guardian/commercial-core';
import type { RegisterListener } from '@guardian/commercial-core';
import { isObject, isString } from '@guardian/libs';

// This message is intended to be used with a GAM creative wrapper.
// For reference, the wrapper will post a message, like so:

/*
* <script  id='ad-load-%%CACHEBUSTER%%'>
//send postMessage to commercial bundle
const metaData = {
    slotId: '%%PATTERN:slot%%'
};
top.window.postMessage(JSON.stringify(
    {
        id: 'bf724866-723c-6b0a-e5d7-ad61535f98b7',
        slotId: '%%PATTERN:slot%%',
        type: 'measure-ad-load',
        value: metaData
    }
), '*');
</script>
* */

const getSlotId = (specs: unknown): string | undefined =>
	isObject(specs) && isString(specs.slotId) ? specs.slotId : undefined;

const eventTimer = EventTimer.get();

const init = (register: RegisterListener): void => {
	register('measure-ad-load', (specs) => {
		eventTimer.trigger('adOnPage', getSlotId(specs));
	});
};

export { init };
