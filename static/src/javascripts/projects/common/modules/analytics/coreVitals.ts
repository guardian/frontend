import { getCookie } from '@guardian/libs';
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';

export const init = () => {
	coreVitals();
};

type CoreWebVitalsPayload = {
	page_view_id: string | null;
	received_timestamp: string | null;
	browser_id: string | null;
	received_date: string;
	fid: null | number;
	cls: null | number;
	lcp: null | number;
	fcp: null | number;
	ttfb: null | number;
};

const timestamp = new Date();
const date = new Date().toISOString().slice(0, 10);

const jsonData: CoreWebVitalsPayload = {
	browser_id: null,
	page_view_id: null,
	received_timestamp: timestamp.toISOString(),
	received_date: date,
	fid: null,
	cls: null,
	lcp: null,
	fcp: null,
	ttfb: null,
};

const coreVitals = (): void => {
	type CoreVitalsArgs = {
		name: string;
		value: number;
	};

	const nineDigitPrecision = (value: number) => {
		// The math functions are to make sure the length of number is <= 9
		return Math.round(value * 1_000_000) / 1_000_000;
	};

	const jsonToSend = ({ name, value }: CoreVitalsArgs): void => {
		switch (name) {
			case 'FCP':
				jsonData.fcp = nineDigitPrecision(value);
				break;
			case 'CLS':
				jsonData.cls = nineDigitPrecision(value);
				break;
			case 'LCP':
				jsonData.lcp = nineDigitPrecision(value);
				break;
			case 'FID':
				jsonData.fid = nineDigitPrecision(value);
				break;
			case 'TTFB':
				jsonData.ttfb = nineDigitPrecision(value);
				break;
		}

		// eslint-disable-no-unnecessary-condition @typescript-eslint/no-unnecessary-condition
		// eslint-disable-prefer-optional-chain @typescript-eslint/prefer-optional-chain
		if (window.guardian.ophan) {
			jsonData.page_view_id = window.guardian.ophan.pageViewId;
			// jsonData.browser_id = window.guardian.config.ophan.browserId;
		}

		// Fallback to check for browser ID
		// eslint-disable-prefer-optional-chain @typescript-eslint/prefer-optional-chain
		if (getCookie({ name: 'bwid' })) {
			jsonData.browser_id = getCookie({ name: 'bwid' });
		}

		const endpoint =
			window.location.hostname === 'm.code.dev-theguardian.com' ||
			window.location.hostname === 'localhost' ||
			window.location.hostname === 'preview.gutools.co.uk'
				? 'https://performance-events.code.dev-guardianapis.com/core-web-vitals'
				: 'https://performance-events.guardianapis.com/core-web-vitals';

		// Browser support
		// getCLS(): Chromium,
		// getFCP(): Chromium, Firefox, Safari Technology Preview
		// getFID(): Chromium, Firefox, Safari, Internet Explorer (with the polyfill)
		// getLCP(): Chromium
		// getTTFB(): Chromium, Firefox, Safari, Internet Explorer

		// We will send all data whenever any update. This means `null` values will appear in the lake
		// and need handling.

		// As of Version 2.0, CLS values should only be sent when FCP is sent
		// https://github.com/GoogleChrome/web-vitals/blob/main/CHANGELOG.md#v200-2021-06-01
		if (jsonToSend.name === 'FCP') {
			if (jsonData.fcp !== null && jsonData.fcp > 0) {
				fetch(endpoint, {
					method: 'POST', // *GET, POST, PUT, DELETE, etc.
					mode: 'cors', // no-cors, *cors, same-origin
					cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
					credentials: 'same-origin', // include, *same-origin, omit
					headers: {
						'Content-Type': 'application/json',
					},
					redirect: 'follow',
					referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-w
					body: JSON.stringify(jsonData),
				}).catch((error) => console.log(error));
			}
		}
	};

	getCLS(jsonToSend, false);
	getFID(jsonToSend);
	getLCP(jsonToSend);
	getFCP(jsonToSend);
	getTTFB(jsonToSend);
};
