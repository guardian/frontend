// @flow
import bean from 'bean';
import bonzo from 'bonzo';

/**
    videojs plugins can't use arrow functions
    as 'this' needs to be available as it 
    represents an instance of the videojs player
**/

// eslint-disable-next-line func-style
function fullscreener(): void {
    const player = this;
    const clickbox = bonzo.create(
        '<div class="vjs-fullscreen-clickbox"></div>'
    )[0];
    const events = {
        click(e: Object): void {
            if (player.paused()) {
                player.play();
            } else {
                player.pause();
            }
            e.stop();
        },
        dblclick(e: Object): void {
            e.stop();
            if (player.isFullscreen()) {
                player.exitFullscreen();
            } else {
                player.requestFullscreen();
            }
        },
    };

    bonzo(clickbox).appendTo(player.contentEl());

    bean.on(clickbox, 'click', events.click.bind(player));
    bean.on(clickbox, 'dblclick', events.dblclick.bind(player));

    player.on('fullscreenchange', (): void => {
        if (player.isFullscreen()) {
            player.trigger('player:fullscreen');
        }
    });
}

export { fullscreener };
