import reportError from '../../../lib/report-error';
import { postMessage } from './messenger/post-message';

/**
 * A message that is sent from an iframe following a standard format we own
 *
 * Allow messages with `unknown` payloads so the consumer can deal with deserializing into
 * a format they can handle
 *
 * TODO: EXAMPLE OF FORMAT
 *
 * @example
 *
 * const msg: StandardMessage<{
 *		width: number; height: number;
 * }> = {
 *		id: 'id',
 *		type: 'resize',
 *  	value: {
 * 			width: 300,
 * 			height: 250,
 *  	};
 * };
 *
 * const msg2: StandardMessage = {
 *		id: 'id',
 *		type: 'type',
 *		value: 'foo'
 * };
 */
type StandardMessage = {
	id: string;
	type: string;
	iframeId?: string | null | undefined;
	slotId?: string | null | undefined;
	/**
	 * The `value` property is generic since it is up to the sender to attach data
	 * }
	 */
	value: unknown;
};

/**
 * A legacy from programmatic ads running in friendly iframes. They can
 * on occasion be larger than the size returned by DFP. And so they
 * have been setup to send a message of the form:
 */
type ProgrammaticMessage = {
	type: string;
	value: {
		id?: string | null | undefined;
		slotId?: string | null | undefined;
		height: number;
		width: number;
	};
};

/**
 * TODO
 */
type ListenerCallback = (
	specs: unknown | null | undefined,
	ret: unknown,
	iframe?: HTMLIFrameElement | null | undefined,
) => unknown;

type Listeners = Record<
	string,
	ListenerCallback | ListenerCallback[] | undefined | null
>;
interface Options {
	window?: WindowProxy;
	persist?: boolean;
}

export type RegisterListener = (
	type: string,
	callback: ListenerCallback,
	options?: Options,
) => void;

export type UnregisterListener = (
	type: string,
	callback?: ListenerCallback,
	options?: Options,
) => void;

const LISTENERS: Listeners = {};
let REGISTERED_LISTENERS = 0;

const error405 = {
	code: 405,
	message: 'Service %% not implemented',
};
const error500 = {
	code: 500,
	message: 'Internal server error\n\n%%',
};

/**
 * Convert a ...
 *
 * @param payload
 * @returns
 */
const isProgrammaticMessage = (
	payload: unknown,
): payload is ProgrammaticMessage => {
	const payloadToCheck = payload as ProgrammaticMessage;
	return (
		payloadToCheck.type === 'set-ad-height' &&
		('id' in payloadToCheck.value || 'slotId' in payloadToCheck.value) &&
		'height' in payloadToCheck.value
	);
};

/**
 * TODO ...
 *
 * @param payload
 * @returns
 */
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

/**
 * Incoming messages contain the ID of the iframe into which the source window is embedded.
 */
const getIframe = (data: StandardMessage) => {
	if (data.slotId) {
		const container = document.getElementById(`dfp-ad--${data.slotId}`);
		const iframes = container
			? container.getElementsByTagName('iframe')
			: null;
		return iframes?.length ? iframes[0] : null;
	} else if (data.iframeId) {
		const el = document.getElementById(data.iframeId);
		if (el instanceof HTMLIFrameElement) {
			return el;
		}
		return null;
	}
};

/**
 * Convert an `unknown` payload to the standard message format
 *
 * Until DFP provides a way for us to identify with 100% certainty our
 * in-house creatives, we are left with doing some basic tests
 * such as validating the anatomy of the payload and whitelisting
 * event type
 */
const isValidPayload = (payload: unknown): payload is StandardMessage => {
	const payloadToCheck = payload as StandardMessage;
	return (
		'type' in payloadToCheck &&
		'value' in payloadToCheck &&
		'id' in payloadToCheck &&
		payloadToCheck.type in LISTENERS &&
		/^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(payloadToCheck.id)
	);
};

/**
 * Cheap string formatting function
 *
 * @param error An object `{ code, message }`. `message` is a string where successive
 * occurrences of %% will be replaced by the following arguments
 * @param args Arguments that will replace %%
 *
 * @example
 * formatError({ message: "%%, you are so %%" }, "Regis", "lovely")
 * => { message: "Regis, you are so lovely" }
 */
const formatError = (error: { message: string }, ...args: string[]) =>
	args.reduce((e, arg) => {
		e.message = e.message.replace('%%', arg);
		return e;
	}, error);

/**
 * TODO
 *
 * @param event
 * @returns
 */
const eventToStandardMessage = (event: MessageEvent) => {
	try {
		const data: unknown = JSON.parse(event.data);

		const message = isProgrammaticMessage(data)
			? toStandardMessage(data)
			: data;

		if (isValidPayload(message)) {
			return message;
		}
	} catch (ex) {
		return null;
	}
};

/**
 * TODO ...
 * @param event
 * @returns
 */
const onMessage = (
	event: MessageEvent<string>,
): Promise<unknown> | undefined => {
	const data = eventToStandardMessage(event);

	if (!data) {
		return;
	}

	const respond = (error: { message: string } | null, result: unknown) => {
		postMessage(
			{
				id: data.id,
				error,
				result,
			},
			event.source ?? window,
		);
	};

	const listener = LISTENERS[data.type];

	if (Array.isArray(listener) && listener.length) {
		// Because any listener can have side-effects (by unregistering itself),
		// we run the promise chain on a copy of the `LISTENERS` array.
		// Hat tip @piuccio
		const promise =
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
			listener.slice().reduce<Promise<unknown>>(
				(func, listener) =>
					func.then((ret) => {
						const thisRet = listener(
							data.value,
							ret,
							getIframe(data),
						);
						return thisRet === undefined ? ret : thisRet;
					}),
				Promise.resolve(true),
			);

		return promise
			.then((response) => {
				respond(null, response);
			})
			.catch((ex) => {
				reportError(ex, {
					feature: 'native-ads',
				});
				respond(formatError(error500, ex), null);
			});
	} else if (typeof listener === 'function') {
		// We found a persistent listener, to which we just delegate
		// responsibility to write something. Anything. Really.
		listener(data.value, respond, getIframe(data));
	} else {
		// If there is no routine attached to this event type, we just answer
		// with an error code
		respond(formatError(error405, data.type), null);
	}
};

const on = (window: WindowProxy) => {
	window.addEventListener('message', (event) => void onMessage(event));
};

const off = (window: WindowProxy) => {
	window.removeEventListener('message', (event) => void onMessage(event));
};

export const register: RegisterListener = (type, callback, options): void => {
	if (REGISTERED_LISTENERS === 0) {
		on(options?.window ?? window);
	}

	// Persistent LISTENERS are exclusive
	if (options?.persist) {
		LISTENERS[type] = callback;
		REGISTERED_LISTENERS += 1;
	} else {
		const listeners = LISTENERS[type] ?? [];

		if (Array.isArray(listeners) && !listeners.includes(callback)) {
			LISTENERS[type] = [...listeners, callback];
			REGISTERED_LISTENERS += 1;
		}
	}
};

export const unregister: UnregisterListener = (type, callback, options) => {
	const listeners = LISTENERS[type];

	if (listeners === undefined) {
		throw new Error(formatError(error405, type).message);
	} else if (listeners === callback) {
		LISTENERS[type] = null;
		REGISTERED_LISTENERS -= 1;
	} else if (Array.isArray(listeners)) {
		if (callback === undefined) {
			LISTENERS[type] = [];
			REGISTERED_LISTENERS -= listeners.length;
		} else {
			LISTENERS[type] = listeners.filter((cb) => {
				const callbacksEqual = cb === callback;
				if (callbacksEqual) {
					REGISTERED_LISTENERS -= 1;
				}
				return !callbacksEqual;
			});
		}
	}

	if (REGISTERED_LISTENERS === 0) {
		off(options?.window ?? window);
	}
};

export const init = (
	...modules: Array<(register: RegisterListener) => void>
): void => {
	modules.forEach((moduleInit) => moduleInit(register));
};

export const _ = { onMessage };
