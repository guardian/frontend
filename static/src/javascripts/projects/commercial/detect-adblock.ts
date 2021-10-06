import { isAdBlockInUse } from '@guardian/commercial-core';

type Listener = { (active: boolean): void };

export const init = (): void => {
	isAdBlockInUse().then(
		(blockerDetected: boolean) => {
			const adBlockers = window.guardian.adBlockers;

			adBlockers.active = blockerDetected;

			// Run each listener
			runEachListener(adBlockers.onDetect);

			// Run subsequent listeners immediately
			adBlockers.onDetect.push = function () {
				const toRun = Array.prototype.slice.call(arguments, 0);
				runEachListener(toRun);
				return toRun.length;
			};

			function runEachListener(listeners: Listener[]) {
				listeners.forEach(function (listener: {
					(active: boolean): void;
				}) {
					try {
						listener(!!adBlockers.active);
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
