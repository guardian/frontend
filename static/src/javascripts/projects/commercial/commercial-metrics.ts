import { log } from '@guardian/libs';
import config_ from '../../lib/config';

const endpoint =
	'http://performance-events.code.dev-guardianapis.com/commercial-metrics';

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
	metrics: DataPoint[];
	properties: DataPoint[];
};

type DataPoint = {
	name: string;
	value: number;
};

let logged = false;

const logData = (): void => {
	if (logged) return;
	if (!window.guardian.ophan) return;

	const timestamp = new Date().toISOString();
	const date = timestamp.slice(0, 10);

	const metrics: CommercialMetrics = {
		browser_id: config.get('ophan.browserId'),
		page_view_id: window.guardian.ophan.pageViewId,
		received_timestamp: timestamp,
		received_date: date,
		platform: 'NEXT_GEN',
		metrics: [{ name: 'xxx', value: 123 }],
		properties: [{ name: 'xxzzzzzx', value: 123 }],
	};

	const analyticsData = JSON.stringify(metrics);

	if (document.visibilityState === 'hidden') {
		log('commercial', 'About to send commercial metrics');
		logged = navigator.sendBeacon(endpoint, analyticsData);
	}
};

export { logData };
