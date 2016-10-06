(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('videojs-embed', ["videojs"], function (a0) {
      return (factory(a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("video.js"));
  } else {
    root['videojs-embed'] = factory(videojs);
  }
}(this, function (videojs) {


videojs.plugin('embed', function(options) {

    if (!options.embeddable) { return false; }

    var player = this,
        vjsComponent = videojs.getComponent('Component'),
        vjsButton = videojs.getComponent('Button');

    videojs.EmbedOverlayInput = videojs.extend(vjsComponent, {
        constructor: function(player, options) {
            vjsComponent.call(this, player, options);
            this.location = options.location;
        }
    });

    videojs.EmbedOverlayInput.prototype.setSrc = function() {
        this.el().value = '<iframe src="' + this.location + '" width="560" height="315" frameborder="0" allowfullscreen></iframe>';
    };

    videojs.EmbedOverlay = videojs.extend(vjsComponent, {
        constructor: function(player, options) {
            vjsComponent.call(this, player, options);

            this.input = new videojs.EmbedOverlayInput(player, {
                location: options.location,
                el: vjsComponent.prototype.createEl('input', {
                    className: 'vjs-embedoverlay-input'
                },{
                    type: 'text'
                })
            });
            this.hide();
            player.addChild(this);
            this.el().appendChild(this.input.el());
            this.input.setSrc();
        }
    });

    videojs.EmbedOverlay.prototype.isVisible = false;
    videojs.EmbedOverlay.prototype.show = function() {
        this.el().style.display = 'block';
        this.isVisible = true;
        this.input.el().focus();
        this.input.el().select();
    };
    videojs.EmbedOverlay.prototype.hide = function() { this.el().style.display = 'none'; this.isVisible = false; };

    videojs.EmbedOverlay.prototype.toggle = function() {
        this[this.isVisible ? 'hide' : 'show']();
    };

    videojs.EmbedButton = videojs.extend(vjsButton, {
        constructor: function (player, options) {
            vjsButton.call(this, player, options);
            this.on('click', this.onClick);
            this.overlay = new videojs.EmbedOverlay(player, {
                location: options.location,
                el: vjsComponent.prototype.createEl('div', {
                    className: 'vjs-embedoverlay',
                    innerHTML: '<div class="vjs-embedoverlay-content"><span class="vjs-embedoverlay-text">Embed code</span></div>'
                })
            });
        }
    });

    videojs.EmbedButton.prototype.onClick = function () {
        this.overlay.toggle();
    };

    player.ready(function() {
        var button = new videojs.EmbedButton(player, {
            location: options.location,
            el: vjsComponent.prototype.createEl('div', {
                className: 'vjs-embed-button vjs-control',
                innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">Embed</span></div>'
            },{
                role: 'button'
            })
        });

        player.controlBar.addChild(button);
    });

});


}));
