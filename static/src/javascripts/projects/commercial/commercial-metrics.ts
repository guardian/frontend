import { EventTimer } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import config_ from '../../lib/config';

// This is really a hacky workaround ⚠️
const config = config_ as {
	get: (s: string, d?: unknown) => unknown;
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

const isDev = Boolean(config.get('page.isDev', false));
const devProperties: Properties[] = isDev
	? [{ name: 'isDev', value: window.location.hostname }]
	: [];

const endpoint = isDev
	? '//performance-events.code.dev-guardianapis.com/commercial-metrics'
	: '//performance-events.guardianapis.com/commercial-metrics';

const logData = (): void => {
	if (logged) return;
	if (!window.guardian.ophan) return;
	if (document.visibilityState !== 'hidden') return;

	const timestamp = new Date().toISOString();
	const date = timestamp.slice(0, 10);
	const eventTimer = EventTimer.get();
	const events = eventTimer.events;

	const properties: Properties[] = Object.entries(eventTimer.properties)
		.map((property) => {
			const [name, value] = property;
			return { name, value: String(value) };
		})
		.concat(devProperties);

	const metrics: Metrics[] = events.map((event) => {
		return { name: event.name, value: Math.ceil(event.ts) };
	});

	const browser_id = config.get('ophan.browserId') as string | undefined;

	const commercialMetrics: CommercialMetrics = {
		browser_id,
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

const init = (): void => {
	if (!config.get('switches.commercialMetrics', false)) return;

	const userIsInSamplingGroup = Math.random() <= 0.01;

	if (isDev || userIsInSamplingGroup)
		document.addEventListener('visibilitychange', logData);
};

export { init };
