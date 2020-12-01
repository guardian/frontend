// @flow strict
// Monkey patch to facilitate the removal of ophan tracking from the commercial bundle sent to DCR.
export default {
  // $FlowFixMe
  record: value => {
    if (window && window.guardian && window.guardian.ophan && window.guardian.ophan.record) {
      window.guardian.ophan.record(value);
    }
  },
  // $FlowFixMe
  trackComponentAttention: (name, el, visibilityThreshhold) => {
    if (window && window.guardian && window.guardian.ophan && window.guardian.ophan.trackComponentAttention) {
      window.guardian.ophan.trackComponentAttention(name, el, visibilityThreshhold);
    }
  },
  // $FlowFixMe
  setEventEmitter: value => {
    if (window && window.guardian && window.guardian.ophan && window.guardian.ophan.setEventEmitter) {
      window.guardian.ophan.setEventEmitter(value);
    }
  },
  viewId: (() => {
    if (window && window.guardian && window.guardian.ophan && window.guardian.ophan.viewId) {
      return window.guardian.ophan.viewId;
    }
    return null;
  })(),
  pageViewId: (() => {
    if (window && window.guardian && window.guardian.ophan && window.guardian.ophan.pageViewId) {
      return window.guardian.ophan.pageViewId;
    }
    return null;

  })()
};