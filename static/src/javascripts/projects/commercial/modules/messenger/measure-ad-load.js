import { markTime } from 'lib/user-timing';
import once from 'lodash/once';

// This message is intended to be used with a DFP creative wrapper.
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

const recordFirstAdLoaded = once(() => {
    markTime('First Ad Loaded');
});

const init = (register) => {
    register('measure-ad-load', (specs) => {
        // TODO: Replace recordFirstAdLoaded with commercial core's API
        recordFirstAdLoaded();
        if (specs.slotId === 'top-above-nav') {
            // TODO: Replace markTime with commercial core's API
            markTime('topAboveNav Ad loaded')
        }
    });
}

export { init };
