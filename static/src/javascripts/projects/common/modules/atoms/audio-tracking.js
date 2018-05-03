// @flow
import config from 'lib/config';
import ophan from 'ophan/ng';

const audioSelector = '.gu-media--audio'

// Sends a media event to Ophan
const record = (mediaId: String, eventType: String) => {
    ophan.record({ audio: { id: `gu-audio-${mediaId}`, eventType: `audio:content:${eventType}`}});
}

const constant = a => b => a;

// Determines whether a reader has listened up to pct% of the audio track
const percent = (pct: number) => (event: Event): Boolean => 
    event instanceof ProgressEvent && 
    event.lengthComputable && 
    Math.floor(event.loaded / event.total * 100) == pct;

// Sends an `eventType` only if `pred(event)`
const recordIf = (pred: Event => Boolean, eventType: String): void => (event: Event) => {
    if (pred(event)) {
        record(event.target.getAttribute('data-media-id'), eventType);
    }
}

const init = (): void => {
    const audios = Array.from(document.querySelectorAll(audioSelector));
    const events = [
        ['canplay', recordIf(constant(true), 'READY')],
        ['playing', recordIf(constant(true), 'play')],
        ['progress', recordIf(percent(25), '25')],
        ['progress', recordIf(percent(50), '50')],
        ['progress', recordIf(percent(75), '75')],
        ['ended', recordIf(constant(true), 'end')]
    };
    
    events.forEach(([eventType, action]) => {
        // Just in case there is more than one audio on the page,
        // we delegate to the document
        document.addEventListener(eventType, function listener(event) {
            const audio = audios.find(event.target);

            if (!audio) return;

            action(event);

            // These are all one-time events
            document.removeEventListener(eventType, listener);
        });
    });
};

export { init };
