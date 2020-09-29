
// eslint disable:no-use-before-define

import ophan from "ophan/ng";

const format = (t: number) => t.toFixed(0).padStart(2, '0');

const formatTime = (t: number) => {
  const second = Math.floor(t % 60);
  const minute = Math.floor(t % 3600 / 60);
  const hour = Math.floor(t / 3600);
  return `${format(hour)}:${format(minute)}:${format(second)}`;
};

const range = (min: number, max: number) => {
  const ret = [];
  let x = min;
  while (x < max) {
    ret.push(x);
    x += 1;
  }
  return ret;
};

const sendToOphan = (id: string, eventName: string) => {
  ophan.record({
    audio: {
      id,
      eventType: `audio:content:${eventName}`
    }
  });
};

const monitorPercentPlayed = (player: HTMLMediaElement, marker: number, id: string) => {
  const eventName = marker === 99 ? 'end' : marker.toLocaleString();

  player.addEventListener('timeupdate', function listener(e) {
    const percentPlayed = Math.round(player.currentTime / player.duration * 100);
    if (percentPlayed >= marker) {
      sendToOphan(id, eventName);
      player.removeEventListener(e.type, listener);
    }
  });
};

const registerOphanListeners = (el: HTMLMediaElement): void => {
  const mediaId = el.getAttribute('data-media-id') || '';

  el.addEventListener('play', () => {
    sendToOphan(mediaId, 'play');
  }, { once: true });

  monitorPercentPlayed(el, 25, mediaId);
  monitorPercentPlayed(el, 50, mediaId);
  monitorPercentPlayed(el, 75, mediaId);
  monitorPercentPlayed(el, 99, mediaId);
};

export { format, formatTime, range, sendToOphan, monitorPercentPlayed, registerOphanListeners };