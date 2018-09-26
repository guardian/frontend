// @flow
import { sendToOphan } from 'common/modules/audio/utils';

const monitorPercentPlayed = (
    player: HTMLMediaElement,
    marker: number,
    id: string
) => {
    const eventName = marker === 99 ? 'end' : marker.toLocaleString();

    player.addEventListener('timeupdate', function listener(e) {
        const percentPlayed = Math.round(
            (player.currentTime / player.duration) * 100
        );
        if (percentPlayed >= marker) {
            sendToOphan(id, eventName);
            player.removeEventListener(e.type, listener);
        }
    });
};

const playerObserved = (el: ?HTMLElement, id: string) => {
    const observer = new window.IntersectionObserver(
        (entries, self) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sendToOphan(id, 'ready');
                    self.disconnect();
                }
            });
        },
        {
            threshold: 1.0,
        }
    );
    observer.observe(el);
};

export { monitorPercentPlayed, playerObserved };
