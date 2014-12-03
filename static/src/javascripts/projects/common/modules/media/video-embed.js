/* global videojs */
define([], function(){

    return function(options) {
        if(!options.embedable) { return false; }

        var player = this;

        //Overlay = videojs.Component.extend({
        //    init: function(player, options) {
        //        videojs.Component.call(this, player, options);
        //    }
        //});
        //
        //Overlay.prototype.isVisible = false;
        //
        //Overlay.prototype.show = function() {
        //
        //};
        //
        //Overlay.prototype.hide = function() {
        //    //
        //};
        //
        //Overlay.prototype.toggle = function() {
        //    this[this.isVisble ? 'hide' : 'show']();
        //};

        var EmbedButton

        videojs.EmbedButton = videojs.Button.extend({
            init: function(player, options) {
                videojs.Button.call(this, player, options);
            }
        });

        videojs.EmbedButton.prototype.kind_ = 'embed';
        videojs.EmbedButton.prototype.buttonText = 'Embed';
        videojs.EmbedButton.prototype.className = 'vjs-embed-button';

        videojs.EmbedButton.prototype.buildCSSClass = function() {
            return 'vjs-embed-button ' + videojs.Button.prototype.buildCSSClass.call(this);
        };

        videojs.EmbedButton.prototype.onClick = function(e) {
            videojs.Button.prototype.onClick.call(this);
            console.log('embed button clicked');
            //if(!this.overlay) {
            //    this.overlay = new Overlay(player);
            //}
            //this.overlay.toggle();
        };

        videojs.EmbedButton.prototype.createEl = function(type, props) {
            videojs.Button.prototype.createEl.call(this, "div");
        };

        var button = new videojs.EmbedButton(player, options);

        player.controlBar.addChild(button);
    };
});
