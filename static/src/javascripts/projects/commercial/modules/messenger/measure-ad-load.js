import { EventTimer } from "@guardian/commercial-core";

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

const eventTimer = EventTimer.get();

const init = (register) => {
    register('measure-ad-load', (specs) => {
        eventTimer.trigger('adOnPage');
        if (specs.slotId === 'top-above-nav') {
            eventTimer.trigger('adOnPage','top-above-nav');
        }
    });
}

export { init };
