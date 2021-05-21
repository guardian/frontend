import { EventTimer } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import config_ from '../../lib/config';

const endpoint =
	'//performance-events.code.dev-guardianapis.com/commercial-metrics';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string) => string;
};

type CommercialMetrics = {
	browser_id?: string;
	page_view_id: string;
	received_timestamp: string;
	received_date: string;
	platform: string;
	metrics: Metrics[];
	properties: Properties[];
};

type Metrics = {
	name: string;
	value: number;
};

type Properties = {
	name: string;
	value: string;
};

let logged = false;

const logData = (): void => {
	if (logged) return;
	if (!window.guardian.ophan) return;
	if (document.visibilityState !== 'hidden') return;

	const timestamp = new Date().toISOString();
	const date = timestamp.slice(0, 10);
	const eventTimer = EventTimer.get();
	const events = eventTimer.events;

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
	// for (const [key, value] of Object.entries(object1)) {
	// 	console.log(`${key}: ${value}`);
	// }

	// https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards

	const properties: Properties[] = Object.entries(eventTimer.properties).map(
		(property) => {
			const [name, value] = property;
			return { name, value: String(value) };
		},
	);

	const metrics: Metrics[] = events.map((event) => {
		return { name: event.name, value: Math.ceil(event.ts) };
	});

	const commercialMetrics: CommercialMetrics = {
		browser_id: config.get('ophan.browserId'),
		page_view_id: window.guardian.ophan.pageViewId,
		received_timestamp: timestamp,
		received_date: date,
		platform: 'NEXT_GEN',
		metrics,
		properties,
	};

	log('commercial', 'About to send commercial metrics', commercialMetrics);
	logged = navigator.sendBeacon(endpoint, JSON.stringify(commercialMetrics));
};

export { logData };
