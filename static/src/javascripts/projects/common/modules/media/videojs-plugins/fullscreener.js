import bean from 'bean';
import bonzo from 'bonzo';

/**
    videojs plugins can't use arrow functions
    as 'this' needs to be available as it 
    represents an instance of the videojs player
* */
const fullscreener = function fullscreener() {
    const clickbox = bonzo.create(
        '<div class="vjs-fullscreen-clickbox"></div>'
    )[0];

    bonzo(clickbox).appendTo(this.contentEl());

    bean.on(
        clickbox,
        'click',
        (e) => {
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
        (e) => {
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
        () => {
            if (this.isFullscreen()) {
                this.trigger('player:fullscreen');
            }
        }
    );
};

export { fullscreener };
