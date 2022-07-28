import { isAdBlockInUse } from '@guardian/commercial-core';

type Listener = { (active: boolean): void };

export const init = (): void => {
	isAdBlockInUse().then(
		(blockerDetected: boolean) => {
			const adBlockers = window.guardian.adBlockers;

			adBlockers.active = blockerDetected;

			// Run each listener
			runEachListener(adBlockers.onDetect);

			// If subsequent listeners are added to the queue, they should be run immediately
			adBlockers.onDetect.push = function (...args) {
				// push the function or functions onto the queue
				const arrayLen = Array.prototype.push.call(
					adBlockers.onDetect,
					...args,
				);
				// then execute them
				runEachListener(args);
				return arrayLen;
			};

			function runEachListener(listeners: Listener[]) {
				listeners.forEach(function (listener: Listener) {
					try {
						listener(blockerDetected);
					} catch (e) {
						console.log(e);
					}
				});
			}
		},
		(error) => {
			console.log(error);
		},
	);
};
