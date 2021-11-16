const eventMetrics = {
	play: 'metric1',
	skip: 'metric2',
	'25': 'metric3',
	'50': 'metric4',
	'75': 'metric5',
	watched25: 'metric3',
	watched50: 'metric4',
	watched75: 'metric5',
	end: 'metric6',
} as const;

type EventType = keyof typeof eventMetrics;
type Metric = typeof eventMetrics[EventType] | 'metric24' | 'metric25';

type EventMetrics = Partial<typeof eventMetrics>;

type MediaEvent = {
	mediaId: string;
	mediaType: string;
	eventType: EventType;
	isPreroll: boolean;
};

type InitialFieldsObject = {
	eventCategory: string;
	eventAction: string;
	eventLabel: string;
	dimension19: string;
	dimension20: string;
};
type MetricFieldsObject = Partial<Record<Metric, 1>>;
type FinalFieldsObject = InitialFieldsObject & MetricFieldsObject;

type EventAction = (me: MediaEvent) => string;

const buildGoogleAnalyticsEvent = (
	mediaEvent: MediaEvent,
	metrics: EventMetrics,
	canonicalUrl: string,
	player: string,
	eventAction: EventAction,
	videoId: string,
): FinalFieldsObject => {
	const action = eventAction(mediaEvent);
	const fieldsObject: FinalFieldsObject = {
		eventCategory: 'media',
		eventAction: action,
		eventLabel: canonicalUrl,
		dimension19: videoId,
		dimension20: player,
	};
	if (mediaEvent.eventType in metrics) {
		const index = metrics[mediaEvent.eventType];
		if (index !== undefined) fieldsObject[index] = 1;
	}
	return fieldsObject;
};

const getGoogleAnalyticsEventAction = (mediaEvent: MediaEvent): string => {
	let action = `${mediaEvent.mediaType} `;
	if (mediaEvent.isPreroll) {
		action += 'preroll';
	} else {
		action += 'content';
	}
	return action;
};

const buildPfpEvent = (
	pfpEventType: 'adStart' | 'adEnd',
	videoId: string,
): FinalFieldsObject => {
	const pfpEventMetric = pfpEventType === 'adStart' ? 24 : 25;
	return {
		eventCategory: 'media',
		eventAction: 'video preroll',
		eventLabel: videoId,
		dimension19: videoId,
		dimension20: 'gu-video-youtube',
		[`metric${pfpEventMetric}`]: 1,
	};
};

export {
	buildGoogleAnalyticsEvent,
	getGoogleAnalyticsEventAction,
	buildPfpEvent,
};
