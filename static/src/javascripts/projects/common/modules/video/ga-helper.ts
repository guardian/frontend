

type MediaEvent = {
  mediaId: string;
  mediaType: string;
  eventType: string;
  isPreroll: boolean;
};

const buildGoogleAnalyticsEvent = (mediaEvent: MediaEvent, metrics: Object, canonicalUrl: string, player: string, eventAction: (arg0: MediaEvent) => string, videoId: string) => {
  const category = 'media';
  const playerName = player;
  const action = eventAction(mediaEvent);
  const fieldsObject = {
    eventCategory: category,
    eventAction: action,
    eventLabel: canonicalUrl,
    dimension19: videoId,
    dimension20: playerName
  };
  // Increment the appropriate metric based on the event type
  const metricId = metrics[mediaEvent.eventType];
  if (metricId) {
    fieldsObject[metricId] = 1;
  }
  return fieldsObject;
};

const getGoogleAnalyticsEventAction = (mediaEvent: MediaEvent) => {
  let action = `${mediaEvent.mediaType} `;
  if (mediaEvent.isPreroll) {
    action += 'preroll';
  } else {
    action += 'content';
  }
  return action;
};

type PfpEventType = "adStart" | "adEnd";

type PfpEventParams = {
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  dimension19: string;
  dimension20: string;
  metric17?: number;
  metric18?: number;
};

const buildPfpEvent = (pfpEventType: PfpEventType, videoId: string): PfpEventParams => {
  const pfpEventMetric = pfpEventType === 'adStart' ? 24 : 25;
  return {
    eventCategory: 'media',
    eventAction: 'video preroll',
    eventLabel: videoId,
    dimension19: videoId,
    dimension20: 'gu-video-youtube',
    [`metric${pfpEventMetric}`]: 1
  };
};

export type { MediaEvent };
export { buildGoogleAnalyticsEvent, getGoogleAnalyticsEventAction, buildPfpEvent };
