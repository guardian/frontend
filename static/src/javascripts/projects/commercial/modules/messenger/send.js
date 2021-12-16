import { postMessage } from './post-message';

/* eslint no-bitwise: "off" */

const send = (type, payload) => {
	const msg = {
		id: 'xxxxxxxxxx'.replace(/x/g, () =>
			((Math.random() * 36) | 0).toString(36),
		),
		iframeId: window.name,
		type,
		value: payload,
	};

	postMessage(msg, window.top, '*');

	return msg.id;
};

export { send };
