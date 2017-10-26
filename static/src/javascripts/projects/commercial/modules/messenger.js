// @flow
import reportError from 'lib/report-error';
import dfpOrigin from 'commercial/modules/messenger/dfp-origin';
import { postMessage } from 'commercial/modules/messenger/post-message';

const ALLOWED_HOSTS = [
    dfpOrigin,
    `${window.location.protocol}//${window.location.host}`,
];
const LISTENERS = {};
let REGISTERED_LISTENERS = 0;

const error405 = {
    code: 405,
    message: 'Service %% not implemented',
};
const error500 = {
    code: 500,
    message: 'Internal server error\n\n%%',
};

type Event = {
    data: string,
    origin: string,
    source: string,
};

type StandardMessage = {
    id: string,
    type: string,
    iframeId: ?string,
    slotId: ?string,
    value: {
        height: number,
        width: number,
    },
};

// A legacy from programmatic ads running in friendly iframes. They can
// on occasion be larger than the size returned by DFP. And so they
// have been setup to send a message of the form:
type ProgrammaticMessage = {
    type: string,
    value: {
        id: ?string,
        slotId: ?string,
        height: number,
        width: number,
    },
};

const isProgrammaticMessage = (
    payload: ProgrammaticMessage | StandardMessage
): boolean =>
    payload.type === 'set-ad-height' &&
    ('id' in payload.value || 'slotId' in payload.value) &&
    'height' in payload.value;

const toStandardMessage = (payload: ProgrammaticMessage): StandardMessage => ({
    id: 'aaaa0000-bb11-cc22-dd33-eeeeee444444',
    type: 'resize',
    iframeId: payload.value.id,
    slotId: payload.value.slotId,
    value: {
        height: +payload.value.height,
        width: +payload.value.width,
    },
});

// Incoming messages contain the ID of the iframe into which the
// source window is embedded.
const getIframe = (data: StandardMessage): ?HTMLElement => {
    if (data.slotId) {
        const container = document.getElementById(`dfp-ad--${data.slotId}`);
        const iframes = container
            ? container.getElementsByTagName('iframe')
            : null;
        return iframes && iframes.length ? iframes[0] : null;
    } else if (data.iframeId) {
        return document.getElementById(data.iframeId);
    }
};

// Until DFP provides a way for us to identify with 100% certainty our
// in-house creatives, we are left with doing some basic tests
// such as validating the anatomy of the payload and whitelisting
// event type
const isValidPayload = (payload: StandardMessage): boolean =>
    'type' in payload &&
    'value' in payload &&
    'id' in payload &&
    payload.type in LISTENERS &&
    /^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(payload.id);

// Cheap string formatting function. It accepts as its first argument
// an object `{ code, message }`. `message` is a string where successive
// occurences of %% will be replaced by the following arguments. e.g.
// `formatError({ message: "%%, you are so %%" }, "Regis", "lovely")`
// returns `{ message: "Regis, you are so lovely" }`. Oh, thank you!
const formatError = (error, ...args) =>
    args.reduce((e, arg) => {
        e.message = e.message.replace('%%', arg);
        return e;
    }, error);

const onMessage = (event: Event): void => {
    let data;
    // We only allow communication with ads created by DFP
    if (ALLOWED_HOSTS.indexOf(event.origin) < 0) {
        return;
    }

    // #? This try-catch is a good target for splitting out into a seperate function
    try {
        // Even though the postMessage API allows passing objects as-is, the
        // serialisation/deserialisation is slower than using JSON
        // Source: https://bugs.chromium.org/p/chromium/issues/detail?id=536620#c11
        data = JSON.parse(event.data);
    } catch (ex) {
        return;
    }

    // These legacy messages are converted into bona fide resize messages
    if (isProgrammaticMessage(data)) {
        data = toStandardMessage(data);
    }

    if (!isValidPayload(data)) {
        return;
    }

    const respond = (error, result): void => {
        postMessage(
            {
                id: data.id,
                error,
                result,
            },
            event.source,
            event.origin
        );
    };

    if (Array.isArray(LISTENERS[data.type]) && LISTENERS[data.type].length) {
        // Because any listener can have side-effects (by unregistering itself),
        // we run the promise chain on a copy of the `LISTENERS` array.
        // Hat tip @piuccio
        const promise = LISTENERS[data.type]
            .slice()
            // We offer, but don't impose, the possibility that a listener returns
            // a value that must be sent back to the calling frame. To do this,
            // we pass the cumulated returned value as a second argument to each
            // listener. Notice we don't try some clever way to compose the result
            // value ourselves, this would only make the solution more complex.
            // That means a listener can ignore the cumulated return value and
            // return something else entirely—life is unfair.
            // We don't know what each callack will be made of, we don't want to.
            // And so we wrap each call in a promise chain, in case one drops the
            // occasional fastdom bomb in the middle.
            .reduce(
                (func, listener) =>
                    func.then(ret => {
                        const thisRet = listener(
                            data.value,
                            ret,
                            getIframe(data)
                        );
                        return thisRet === undefined ? ret : thisRet;
                    }),
                Promise.resolve(true)
            );

        return promise
            .then(response => {
                respond(null, response);
            })
            .catch(ex => {
                reportError(ex, {
                    feature: 'native-ads',
                });
                respond(formatError(error500, ex), null);
            });
    } else if (typeof LISTENERS[data.type] === 'function') {
        // We found a persistent listener, to which we just delegate
        // responsibility to write something. Anything. Really.
        LISTENERS[data.type](respond, data.value, getIframe(data));
    } else {
        // If there is no routine attached to this event type, we just answer
        // with an error code
        respond(formatError(error405, data.type), null);
    }
};

const on = (window: WindowProxy): void => {
    window.addEventListener('message', onMessage);
};

const off = (window: WindowProxy): void => {
    window.removeEventListener('message', onMessage);
};

export type RegisterListeners = (
    type: string,
    callback: () => ?Promise<any> | ?Array<any>,
    options: ?Object
) => void;

export const register: RegisterListeners = (type, callback, options) => {
    if (REGISTERED_LISTENERS === 0) {
        on((options && options.window) || window);
    }

    /* Persistent LISTENERS are exclusive */
    if (options && options.persist) {
        LISTENERS[type] = callback;
        REGISTERED_LISTENERS += 1;
    } else {
        // set LISTENERS[type] to an empty array, if it is currently undefined or null
        LISTENERS[type] = LISTENERS[type] || [];

        if (LISTENERS[type].indexOf(callback) === -1) {
            LISTENERS[type].push(callback);
            REGISTERED_LISTENERS += 1;
        }
    }
};

export const unregister = (
    type: string,
    callback: () => ?Promise<any>,
    options: Object = {}
): void => {
    if (LISTENERS[type] === undefined) {
        throw new Error(formatError(error405, type));
    }

    if (callback === undefined) {
        REGISTERED_LISTENERS -= LISTENERS[type].length;
        LISTENERS[type].length = 0;
    } else if (LISTENERS[type] === callback) {
        LISTENERS[type] = null;
        REGISTERED_LISTENERS -= 1;
    } else {
        const idx = LISTENERS[type].indexOf(callback);
        if (idx > -1) {
            REGISTERED_LISTENERS -= 1;
            LISTENERS[type].splice(idx, 1);
        }
    }

    if (REGISTERED_LISTENERS === 0) {
        off(options.window || window);
    }
};

export const init = (...modules: Array<(r: RegisterListeners) => void>) => {
    modules.forEach(moduleInit => moduleInit(register));
};

export const _ = { onMessage };
