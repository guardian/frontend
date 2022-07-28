import { getCLS, getFID, getLCP } from 'web-vitals';
import config from 'lib/config';
import { mediator } from 'lib/mediator';

const trackerName = config.get(
	'googleAnalytics.trackers.editorial',
	'no-ga-tracker-found',
);

const send = `${trackerName}.send`;

const getTextContent = (el: HTMLElement): string =>
	(el.textContent ?? '').trim();

const trackNonClickInteraction = (actionName: string): void => {
	window.ga(send, 'event', 'Interaction', actionName, {
		nonInteraction: true, // to avoid affecting bounce rate
	});
};

const trackSamePageLinkClick = (target: HTMLElement, tag: string): void => {
	window.ga(send, 'event', 'click', 'in page', tag, {
		nonInteraction: true, // to avoid affecting bounce rate
		dimension13: getTextContent(target),
	});
};

const trackExternalLinkClick = (target: HTMLElement, tag: string): void => {
	const data: {
		dimension13: string;
		dimension48?: string;
	} = {
		dimension13: getTextContent(target),
	};

	const targetURL = target.getAttribute('href');

	if (targetURL) {
		data.dimension48 = targetURL;
	}

	window.ga(send, 'event', 'click', 'external', tag, data);
};

const trackSponsorLogoLinkClick = (target: HTMLElement): void => {
	const sponsorName = target.dataset.sponsor;

	window.ga(send, 'event', 'click', 'sponsor logo', sponsorName, {
		nonInteraction: true,
	});
};

const trackNativeAdLinkClick = (slotName: string, tag: string): void => {
	window.ga(send, 'event', 'click', 'native ad', tag, {
		nonInteraction: true,
		dimension25: slotName,
	});
};

type BoostGaUserTimingFidelityMetrics = {
	standardStart: 'metric18';
	standardEnd: 'metric19';
	commercialStart: 'metric20';
	commercialEnd: 'metric21';
	enhancedStart: 'metric22';
	enhancedEnd: 'metric23';
};

type TimingEvent = {
	timingCategory: string;
	timingVar: keyof BoostGaUserTimingFidelityMetrics;
	timeSincePageLoad: number;
	timingLabel: string;
};

const sendPerformanceEvent = (event: TimingEvent): void => {
	const boostGaUserTimingFidelityMetrics: BoostGaUserTimingFidelityMetrics = {
		standardStart: 'metric18',
		standardEnd: 'metric19',
		commercialStart: 'metric20',
		commercialEnd: 'metric21',
		enhancedStart: 'metric22',
		enhancedEnd: 'metric23',
	};

	window.ga(
		send,
		'timing',
		event.timingCategory,
		event.timingVar,
		event.timeSincePageLoad,
		event.timingLabel,
	);

	/*
       send performance events as normal events too,
       so we can avoid the 0.1% sampling that affects timing events
    */
	if (config.get('switches.boostGaUserTimingFidelity')) {
		// these are our own metrics that map to our timing events
		const metric = boostGaUserTimingFidelityMetrics[event.timingVar];

		const fields: Record<string, unknown> = {
			nonInteraction: true,
			dimension44: metric, // dimension44 is dotcomPerformance
		};

		fields[metric] = event.timeSincePageLoad;

		window.ga(
			send,
			'event',
			event.timingCategory,
			event.timingVar,
			event.timingLabel,
			event.timeSincePageLoad,
			fields,
		);
	}
};

/*
   Track important user timing metrics so that we can be notified and measure
   over time in GA
   https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings
   Tracks into Behaviour > Site Speed > User Timings in GA
*/
const trackPerformance = (
	timingCategory: string,
	timingVar: keyof BoostGaUserTimingFidelityMetrics,
	timingLabel: string,
): void => {
	const timeSincePageLoad = Math.round(window.performance.now());
	const event: TimingEvent = {
		timingCategory,
		timingVar,
		timeSincePageLoad,
		timingLabel,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- extra safety if undefined
	if (window.ga ?? false) {
		sendPerformanceEvent(event);
	} else {
		const timingEvents = config.get<TimingEvent[]>(
			'googleAnalytics.timingEvents',
			[],
		);
		const sendDeferredEventQueue = (): void => {
			timingEvents.map(sendPerformanceEvent);
			mediator.off('modules:ga:ready', sendDeferredEventQueue);
		};

		mediator.on('modules:ga:ready', sendDeferredEventQueue);
		timingEvents.push(event);
	}
};

type CoreVitalsArgs = {
	name: string;
	delta: number;
	id: string;
};

// This matches DCR implementation
// https://www.npmjs.com/package/web-vitals#using-analyticsjs
const sendCoreVital = ({ name, delta, id }: CoreVitalsArgs): void => {
	const { ga } = window;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- extra safety in case it’s undefined
	if (!ga) {
		return;
	}

	ga(send, 'event', {
		eventCategory: 'Web Vitals',
		eventAction: name,
		// Google Analytics metrics must be integers, so the value is rounded.
		// For CLS the value is first multiplied by 1000 for greater precision
		// (note: increase the multiplier for greater precision if needed).
		eventValue: Math.round(name === 'CLS' ? delta * 1000 : delta),
		// The `id` value will be unique to the current page load. When sending
		// multiple values from the same page (e.g. for CLS), Google Analytics can
		// compute a total by grouping on this ID (note: requires `eventLabel` to
		// be a dimension in your report).
		eventLabel: id,
		// Use a non-interaction event to avoid affecting bounce rate.
		nonInteraction: true,
	});
};

// //////////////////////
// Core Vitals Reporting
// Supported only in Chromium but npm module tested in all our supported browsers
// https://www.npmjs.com/package/web-vitals#browser-support

// Only send for roughly 5% of users
// We want all or nothing on the corevitals so that they can be easily compared for a single pageview
// so we do this here rather than in the sendCoreVital function
const randomPerc = Math.random() * 100;
const coreVitalsSampleRate = 5;

if (randomPerc <= coreVitalsSampleRate) {
	// CLS and LCP are captured when the page lifecycle changes to 'hidden'.
	// https://developers.google.com/web/updates/2018/07/page-lifecycle-api#advice-hidden
	getCLS(sendCoreVital); // https://github.com/GoogleChrome/web-vitals#getcls (This is actually DCLS, as doesn't track CLS in iframes, see https://github.com/WICG/layout-instability#cumulative-scores)
	getLCP(sendCoreVital); // https://github.com/GoogleChrome/web-vitals#getlcp

	// FID is captured when a user interacts with the page
	getFID(sendCoreVital); // https://github.com/GoogleChrome/web-vitals#getfid
}

export {
	trackNonClickInteraction,
	trackSamePageLinkClick,
	trackExternalLinkClick,
	trackSponsorLogoLinkClick,
	trackNativeAdLinkClick,
	trackPerformance,
};
