import bean from 'bean';
import bonzo from 'bonzo';

function fullscreener() {
    var player = this,
        clickbox = bonzo.create('<div class="vjs-fullscreen-clickbox"></div>')[0],
        events = {
            click: function(e) {
                if (this.paused()) {
                    this.play();
                } else {
                    this.pause();
                }
                e.stop();
            },
            dblclick: function(e) {
                e.stop();
                if (this.isFullscreen()) {
                    this.exitFullscreen();
                } else {
                    this.requestFullscreen();
                }
            }
        };

    bonzo(clickbox)
        .appendTo(player.contentEl());

    bean.on(clickbox, 'click', events.click.bind(player));
    bean.on(clickbox, 'dblclick', events.dblclick.bind(player));

    player.on('fullscreenchange', function() {
        if (this.isFullscreen()) {
            player.trigger('player:fullscreen');
        }
    });
}

export default fullscreener;
