

import fastdom from "lib/fastdom-promise";
import $ from "lib/$";
import bean from "bean";
import raven from "lib/raven";
import { buildGoogleAnalyticsEvent, getGoogleAnalyticsEventAction } from "common/modules/video/ga-helper";
import config from "lib/config";
import ophan from "ophan/ng";

const gaTracker = config.get('googleAnalytics.trackers.editorial');
const isEmbed = !!window.guardian.isEmbed;

const getCanonicalUrl = (dataset: Object): string => dataset.canonicalUrl || // we need to look up the embedPath for main media videos
dataset.embedPath || // the fallback to window.location.pathname should only happen for main media on fronts
window.location.pathname;

const bindTrackingEvents = (el: HTMLMediaElement): void => {
  const mediaType = el.tagName.toLowerCase();
  const dataset = el.dataset;
  const {
    mediaId
  } = dataset;
  const canonicalUrl = getCanonicalUrl(dataset);

  const playHandler = () => {
    // on play, fire GA event
    const mediaEvent = {
      mediaId,
      mediaType,
      eventType: 'play',
      isPreroll: false
    };
    const events = {
      play: 'metric1'
    };

    window.ga(`${gaTracker}.send`, 'event', buildGoogleAnalyticsEvent(mediaEvent, events, canonicalUrl, 'guardian-videojs', getGoogleAnalyticsEventAction, mediaId));

    // on play, fire Ophan event
    const record = ophanEmbed => {
      const eventObject = {
        video: {
          id: mediaId,
          eventType: 'video:content:play'
        }
      };

      ophanEmbed.record(eventObject);
    };

    if (isEmbed) {
      require.ensure([], require => {
        record(require('ophan/embed'));
      }, 'ophan-embed');
    } else {
      record(ophan);
    }

    // don't fire events every time video is paused then restarted
    bean.off(el, 'play', playHandler);
  };

  bean.on(el, 'play', playHandler);
  bean.on(el, 'ended', () => {
    // track re-plays
    bean.on(el, 'play', playHandler);
  });
  bean.on(el, 'play pause', () => {
    // synthetic click on data-component="main video"
    const figure: HTMLElement = (el.parentNode && el.parentNode.parentNode && el.parentNode.parentNode.parentNode as any);

    figure.click();
  });
};

const initPlayer = (): void => {
  fastdom.read(() => {
    $('.js-gu-media--enhance').each(el => {
      bindTrackingEvents(el);
      // hide download button in Chrome
      el.setAttribute('controlsList', 'nodownload');
    });
  });
};

const initWithRaven = (): void => {
  raven.wrap({
    tags: {
      feature: 'video'
    }
  }, () => {
    initPlayer();
  })();
};

export const initVideoPlayer = (): void => {
  initWithRaven();
};