import { getCookie, log } from '@guardian/libs';
import type { ReportHandler } from 'web-vitals';
import { getCLS, getFCP, getFID, getLCP, getTTFB } from 'web-vitals';
import reportError from 'lib/report-error';
import { forceSendMetrics, setForceSendMetrics } from './forceSendMetrics';
import { shouldCaptureMetrics } from './shouldCaptureMetrics';

type CoreWebVitalsPayload = {
	page_view_id: string | null;
	browser_id: string | null;
	fid: null | number;
	cls: null | number;
	lcp: null | number;
	fcp: null | number;
	ttfb: null | number;
};

const jsonData: CoreWebVitalsPayload = {
	browser_id:
		window.guardian.config.ophan.browserId ??
		getCookie({ name: 'bwid', shouldMemoize: true }),
	page_view_id: window.guardian.ophan.pageViewId,
	fid: null,
	cls: null,
	lcp: null,
	fcp: null,
	ttfb: null,
};

// Needed when we start using version 2
// let hasFCPBeenSent = false;

// By default, sample 1% of users
const userInSample = Math.random() < 1 / 100;
// unless we are forcing metrics for this user because they are participating in an AB test
// for which we need to capture all metrics
const captureMetrics = shouldCaptureMetrics();
// or we are force sending for this page view for some other reason with forceSendMetrics.

/**
 * Restrict a number to 9 digits
 */
const nineDigitPrecision = (value: number) => {
	return Math.round(value * 1_000_000) / 1_000_000;
};

const sendData = () => {
	const endpoint =
		window.location.hostname === 'm.code.dev-theguardian.com' ||
		window.location.hostname === 'localhost' ||
		window.location.hostname === 'preview.gutools.co.uk'
			? 'https://performance-events.code.dev-guardianapis.com/core-web-vitals'
			: 'https://performance-events.guardianapis.com/core-web-vitals';

	fetch(endpoint, {
		method: 'POST',
		mode: 'no-cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json',
		},
		referrerPolicy: 'no-referrer',
		body: JSON.stringify(jsonData),
	})
		.then(() => {
			log('dotcom', 'Successfully recorded Core Web Vitals');
		})
		.catch((error) => {
			reportError(error, 'core-web-vitals');
		});
};

const onReport: ReportHandler = (metric) => {
	switch (metric.name) {
		case 'FCP':
			// Browser support: Chromium, Firefox, Safari Technology Preview
			jsonData.fcp = nineDigitPrecision(metric.value);
			break;
		case 'CLS':
			// Browser support: Chromium,
			jsonData.cls = nineDigitPrecision(metric.value);
			break;
		case 'LCP':
			// Browser support: Chromium
			jsonData.lcp = nineDigitPrecision(metric.value);
			break;
		case 'FID':
			// Browser support: Chromium, Firefox, Safari, Internet Explorer (with the polyfill)
			jsonData.fid = nineDigitPrecision(metric.value);
			break;
		case 'TTFB':
			// Browser support: Chromium, Firefox, Safari, Internet Explorer
			jsonData.ttfb = nineDigitPrecision(metric.value);
			break;
	}

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

	if (captureMetrics || userInSample || forceSendMetrics) {
		log('dotcom', 'About to send Core Web Vitals', jsonData);

		// We will send all data whenever any update.
		// This means `null` values will appear in the lake and need handling
		sendData();
	} else {
		log('dotcom', 'Won’t send Core Web Vitals');
	}
};

/**
 * Calls functions of web-vitals library to collect core web vitals data, registering callbacks which
 * send it to the data lake for a sample of page views.
 * Equivalent dotcom-rendering functionality is here: https://git.io/JBRIt
 */
export const coreVitals = (): void => {
	getCLS(onReport, false);
	getFID(onReport);
	getLCP(onReport);
	getFCP(onReport);
	getTTFB(onReport);
};
