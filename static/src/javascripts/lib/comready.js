import { send } from 'commercial/modules/messenger/send';

/** Allows cross-frame communication with in-app articles */
const comready = (resolve, reject) => {
	const MAX_COUNT = 5;
	let count = 0;
	send('syn', true);
	const intId = setInterval(() => {
		count += 1;
		if (count === MAX_COUNT) {
			clearInterval(intId);
			reject(new Error('Failed to reach page messenger'));
		}
		send('syn', true);
	}, 500);
	window.addEventListener('message', (evt) => {
		if (JSON.parse(evt.data).result !== 'ack') {
			return;
		}
		clearInterval(intId);
		resolve();
	});
};

export { comready };
