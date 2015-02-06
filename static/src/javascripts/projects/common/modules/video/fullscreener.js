define([
    'bean',
    'bonzo'
], function (
    bean,
    bonzo
) {
    function fullscreener() {
        var player = this,
            clickbox = bonzo.create('<div class="vjs-fullscreen-clickbox"></div>')[0],
            events = {
                click: function (e) {
                    this.paused() ? this.play() : this.pause();
                    e.stop();
                },
                dblclick: function (e) {
                    e.stop();
                    this.isFullScreen() ? this.exitFullscreen() : this.requestFullscreen();
                }
            };

        bonzo(clickbox)
            .appendTo(player.contentEl());

        bean.on(clickbox, 'click', events.click.bind(player));
        bean.on(clickbox, 'dblclick', events.dblclick.bind(player));

        player.on('fullscreenchange', function(){
            alert("fullscreenchange");
            if(this.isFullScreen()) { player.trigger('video:fullscreen'); }
        });
    }

    return fullscreener;
});
