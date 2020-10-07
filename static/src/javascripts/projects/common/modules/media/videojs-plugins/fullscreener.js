// @flow
import bean from 'bean';

/**
    videojs plugins can't use arrow functions
    as 'this' needs to be available as it
    represents an instance of the videojs player
* */
const fullscreener = function fullscreener(): void {
    const clickbox = bonzo.create(
        '<div class="vjs-fullscreen-clickbox"></div>'
    )[0];

    bonzo(clickbox).appendTo(this.contentEl());

    bean.on(
        clickbox,
        'click',
        (e: bean): void => {
            if (this.paused()) {
                this.play();
            } else {
                this.pause();
            }
            e.stop();
        }
    );

    bean.on(
        clickbox,
        'dblclick',
        (e: bean): void => {
            e.stop();
            if (this.isFullscreen()) {
                this.exitFullscreen();
            } else {
                this.requestFullscreen();
            }
        }
    );

    this.on(
        'fullscreenchange',
        (): void => {
            if (this.isFullscreen()) {
                this.trigger('player:fullscreen');
            }
        }
    );
};

export { fullscreener };
