import reportError from '../../../lib/report-error';
import { postMessage } from './messenger/post-message';

/**
 * The type of iframe messages we accept
 */
type MessageType =
	| 'background'
	| 'click'
	| 'disable-refresh'
	| 'get-page-targeting'
	| 'get-page-url'
	| 'get-styles'
	| 'measure-ad-load'
	| 'passback'
	| 'resize'
	| 'set-ad-height'
	| 'scroll'
	| 'type'
	| 'viewport';

/**
 * A message that is sent from an iframe following a standard format
 *
 * TODO Is this format formally defined somewhere?
 */
type StandardMessage<T = unknown> = {
	id: string;
	type: MessageType;
	iframeId?: string;
	slotId?: string;
	/**
	 * The `value` property is generic since it is up to the sender to attach arbitrary data
	 *
	 * We mostly treat this as unknown and leave it up to the message
	 * listeners to convert to a type they can handle
	 */
	value: T;
};

/**
 * A legacy from programmatic ads running in friendly iframes. They can
 * on occasion be larger than the size returned by DFP. And so they
 * have been setup to send a message of the form:
 */
type ProgrammaticMessage = {
	type: string;
	value: {
		id?: string;
		slotId?: string;
		height: number;
		width: number;
	};
};

/**
 * Callbacks that can be registered to fire when receiving messages from an iframe
 */
type ListenerCallback = (
	/**
	 * The data payload sent by an iframe, and has type `unknown` because we can't
	 * predict what the iframe will send. It is the responsibility of the callback
	 * to obtain a value of the desired type (or fail gracefully)
	 */
	specs: unknown | undefined,
	/**
	 * Non-persistent callbacks can be chained together. This value is the return
	 * value of the previously fired callback in the chain. It is the responsibility
	 * of the current callback to either ignore it or use it / pass along
	 */
	ret: unknown,
	/**
	 * Reference to the iframe that is the source of the message
	 */
	iframe?: HTMLIFrameElement,
) => unknown;

/**
 * The set of listeners currently registered
 *
 * Each message sent by an iframe has a `type` field which indicates the kind of
 * message e.g. `resize`, `measure-ad-load`. One or more listeners is registered
 * for each type.
 */
type Listeners = Partial<
	Record<MessageType, ListenerCallback | ListenerCallback[] | undefined>
>;

/**
 * Types of functions to register a listener for a given type of iframe message
 */
export type RegisterListener = (
	type: MessageType,
	callback: ListenerCallback,
	options?: {
		window?: WindowProxy;
		persist?: boolean;
	},
) => void;

/**
 * Types of functions to unregister a listener for a given type of iframe message
 *
 */
export type UnregisterListener = (
	type: MessageType,
	callback?: ListenerCallback,
	options?: {
		window?: WindowProxy;
	},
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
 * Determine if an unknown payload has the shape of a programmatic message
 *
 * @param payload The unknown message payload
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
 * Convert a legacy programmatic message to a standard message
 *
 * Note that this only applies to specific resize programmatic messages
 * (these include specific width and height values)
 */
const toStandardMessage = (
	payload: ProgrammaticMessage,
): StandardMessage<{ width: number; height: number }> => ({
	id: 'aaaa0000-bb11-cc22-dd33-eeeeee444444',
	type: 'resize',
	iframeId: payload.value.id,
	slotId: payload.value.slotId,
	value: {
		height: payload.value.height,
		width: payload.value.width,
	},
});

/**
 * Retrieve a reference to the calling iFrame
 *
 * Attempts the following strategies to find the correct iframe:
 * - using the slotId from the incoming message
 * - using the iframeId from the incoming message
 * - checking message event.source (i.e. window) against all page level iframe contentWindows
 *
 * Listeners can then use the iFrame to determine the slot making the postMessage call
 */
const getIframe = (
	message: StandardMessage,
	messageEventSource: MessageEventSource | null,
): HTMLIFrameElement | undefined => {
	if (message.slotId) {
		const container = document.getElementById(`dfp-ad--${message.slotId}`);
		return container?.querySelector('iframe') ?? undefined;
	} else if (message.iframeId) {
		const el = document.getElementById(message.iframeId);
		return el instanceof HTMLIFrameElement ? el : undefined;
	} else if (messageEventSource) {
		const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe');
		return Array.from(iframes).find(
			(iframe) => iframe.contentWindow === messageEventSource,
		);
	}
};

// Regex for testing validity of message ids
const validMessageRegex = /^[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}$/;

/**
 * Narrow an `unknown` payload to the standard message format
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
		validMessageRegex.test(payloadToCheck.id)
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
const formatError = (
	error: { code: number; message: string },
	...args: string[]
) =>
	args.reduce((e, arg) => {
		e.message = e.message.replace('%%', arg);
		return e;
	}, error);

/**
 * Convert a posted message to our StandardMessage format
 *
 * @param event The message event received on the window
 * @returns A message with the `StandardMessage` format, or null if the conversion was unsuccessful
 */
const eventToStandardMessage = (
	event: MessageEvent,
): StandardMessage | undefined => {
	try {
		// Currently all non-string messages are discarded here since parsing throws an error
		// TODO Review whether this is the desired outcome
		const data: unknown = JSON.parse(event.data);

		const message = isProgrammaticMessage(data)
			? toStandardMessage(data)
			: data;

		if (isValidPayload(message)) {
			return message;
		}
	} catch (ex) {
		// Do nothing
	}
};

/**
 * Respond to the original iframe with the result of calling the
 * persistent listener / listener chain
 */
const respond = (
	id: string,
	target: MessageEventSource | null,
	error: { message: string } | null,
	result: unknown,
) => {
	postMessage(
		{
			id,
			error,
			result,
		},
		target ?? window,
	);
};

/**
 * Callback that is fired when an arbitrary message is received on the window
 *
 * @param event The message event received on the window
 */
const onMessage = async (event: MessageEvent<string>): Promise<void> => {
	const message = eventToStandardMessage(event);

	if (!message) {
		return;
	}

	const listener = LISTENERS[message.type];

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
			listener.reduce<Promise<unknown>>(
				(func, listener) =>
					func.then((ret) => {
						const thisRet = listener(
							message.value,
							ret,
							getIframe(message, event.source),
						);
						return thisRet === undefined ? ret : thisRet;
					}),
				Promise.resolve(),
			);

		return promise
			.then((response) => {
				respond(message.id, event.source, null, response);
			})
			.catch((ex) => {
				reportError(ex, {
					feature: 'native-ads',
				});
				respond(
					message.id,
					event.source,
					formatError(error500, ex),
					null,
				);
			});
	} else if (typeof listener === 'function') {
		// We found a persistent listener, to which we just delegate
		// responsibility to write something. Anything. Really.
		// The listener writes something by being given the `respond` function as the spec
		listener(
			// TODO change the arguments expected by persistent listeners to avoid this
			(error: { message: string } | null, result: unknown) =>
				respond(message.id, event.source, error, result),
			message.value,
			getIframe(message, event.source),
		);
	} else {
		// If there is no routine attached to this event type, we just answer
		// with an error code
		respond(
			message.id,
			event.source,
			formatError(error405, message.type),
			null,
		);
	}
};

const on = (window: WindowProxy) => {
	window.addEventListener('message', (event) => void onMessage(event));
};

const off = (window: WindowProxy) => {
	window.removeEventListener('message', (event) => void onMessage(event));
};

/**
 * Register a callback for a given type of iframe message
 *
 * @param type The `type` of message to register against
 * @param callback The callback to register that will receive messages of the given type
 * @param options Options for the target window and whether the callback is persistent
 */
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

/**
 * Unregister a callback for a given type
 *
 * @param type The type of message to unregister against. An iframe will send
 * messages annotated with the type
 * @param callback Optionally include the original callback. If this is included
 * for a persistent callback this function will be unregistered. If it's
 * included for a non-persistent callback only the matching callback is removed,
 * otherwise all callbacks for that type will be unregistered
 * @param options Option for the target window
 */
export const unregister: UnregisterListener = (type, callback, options) => {
	const listeners = LISTENERS[type];

	if (listeners === undefined) {
		throw new Error(formatError(error405, type).message);
	} else if (listeners === callback) {
		LISTENERS[type] = undefined;
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

/**
 * Initialize an array of listener callbacks in a batch
 *
 * @param modules The modules that will register callbacks
 */
export const init = (
	...modules: Array<(register: RegisterListener) => void>
): void => {
	modules.forEach((moduleInit) => moduleInit(register));
};

export const _ = { onMessage };
