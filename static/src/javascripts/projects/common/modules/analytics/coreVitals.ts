import { getCookie } from '@guardian/libs';
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
import reportError from 'lib/report-error';

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

export const coreVitals = (): void => {
	// If the current user is part of a server-side AB test
	// then we always want to sample their core web vitals data.
	const userInTest =
		window.guardian.config.tests &&
		Object.values(window.guardian.config.tests).includes('variant');

	// Otherwise, only send core web vitals data for 1% of users.
	const inSample = Math.random() < 1 / 100;

	if (!userInTest && !inSample) {
		return;
	}

	type CoreVitalsArgs = {
		name: string;
		value: number;
	};

	// Needed when we start using version 2
	// let hasFCPBeenSent = false;

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

		jsonData.page_view_id = window.guardian.ophan.pageViewId;
		// 'window.guardian.config.ophan' does not exist here, so the fallback below might be the solution we go with
		// jsonData.browser_id = window.guardian.config.ophan.browserId;

		// Fallback to check for browser ID
		if (getCookie({ name: 'bwid' })) {
			jsonData.browser_id = getCookie({ name: 'bwid' });
		}

		const endpoint =
			window.location.hostname === 'm.code.dev-theguardian.com' ||
			window.location.hostname === 'localhost' ||
			window.location.hostname === 'preview.gutools.co.uk'
				? 'https://performance-events.code.dev-guardianapis.com/core-web-vitals'
				: 'https://performance-events.guardianapis.com/core-web-vitals';

		const sendData = () => {
			fetch(endpoint, {
				method: 'POST',
				mode: 'cors',
				cache: 'no-cache',
				credentials: 'same-origin',
				headers: {
					'Content-Type': 'application/json',
				},
				redirect: 'follow',
				referrerPolicy: 'no-referrer',
				body: JSON.stringify(jsonData),
			}).catch((error) => reportError(error, 'core-web-vitals'));
		};

		// Browser support
		// getCLS(): Chromium,
		// getFCP(): Chromium, Firefox, Safari Technology Preview
		// getFID(): Chromium, Firefox, Safari, Internet Explorer (with the polyfill)
		// getLCP(): Chromium
		// getTTFB(): Chromium, Firefox, Safari, Internet Explorer

		// We will send all data whenever any update. This means `null` values will appear in the lake
		// and need handling.

		/*
		    --> The logic below is only needed for Version 2 of Google's Core Web Vitals<--
		    As of Version 2.0, CLS values should only be sent if FCP has been sent
	        https://github.com/GoogleChrome/web-vitals/blob/main/CHANGELOG.md#v200-2021-06-01
		if (jsonToSend.name === 'CLS' && hasFCPBeenSent) {
			if (jsonData.cls !== null) {
				sendData();
			}
		} else {
			sendData();
			if (jsonToSend.name === 'FCP') {
				hasFCPBeenSent = true;
			}
		} */

		sendData();
	};

	getCLS(jsonToSend, false);
	getFID(jsonToSend);
	getLCP(jsonToSend);
	getFCP(jsonToSend);
	getTTFB(jsonToSend);
};
