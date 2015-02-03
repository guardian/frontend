define([
    'common/utils/$',
    'common/views/svgs'
], function (
    $,
    svgs
) {
    videojs.plugin('embed', function(options) {

        if (!options.embeddable) { return false; }

        var player = this;

        videojs.EmbedOverlayInput = videojs.Component.extend({
            init: function(player, options) {
                videojs.Component.call(this, player, options);
                this.location = options.location;
            }
        });

        videojs.EmbedOverlayInput.prototype.contentEl = function() { return this.el_; };
        videojs.EmbedOverlayInput.prototype.el = function() {
            return this.el_ = videojs.Component.prototype.createEl('input', {
                className: 'vjs-embedoverlay-input',
                type: 'text'
            });
        };

        videojs.EmbedOverlayInput.prototype.setSrc = function() {
            this.contentEl().value = '<iframe src="' + this.location + '" width="560" height="315" frameborder="0" allowfullscreen></iframe>';
        };

        videojs.EmbedOverlay = videojs.Component.extend({
            init: function(player, options) {
                videojs.Component.call(this, player, options);

                this.input = new videojs.EmbedOverlayInput(player, {
                    location: options.location
                });
                this.hide();
                player.addChild(this);
                this.contentEl().appendChild(this.input.el());
                this.input.setSrc();
            }
        });

        videojs.EmbedOverlay.prototype.isVisible = false;
        videojs.EmbedOverlay.prototype.show = function() {
            this.el().style.display = 'block';
            this.isVisible = true;
            this.input.contentEl().focus();
            this.input.contentEl().select();
        };
        videojs.EmbedOverlay.prototype.hide = function() { this.el().style.display = 'none'; this.isVisible = false; };
        videojs.EmbedOverlay.prototype.contentEl = function() { return this.el_; };

        videojs.EmbedOverlay.prototype.el = function() {
            return this.el_ = this.el_ || videojs.Component.prototype.createEl(null, {
                className: 'vjs-embedoverlay',
                innerHTML: '<div class="vjs-embedoverlay-content"><span class="vjs-embedoverlay-text">Embed code</span></div>'
            })
        };

        videojs.EmbedOverlay.prototype.toggle = function() {
            this[this.isVisible ? 'hide' : 'show']();
        };

        videojs.EmbedButton = videojs.Button.extend({
            init: function (player, options) {
                videojs.Button.call(this, player, options);
                this.on('click', this.onClick);
                this.overlay = new videojs.EmbedOverlay(player, {
                    location: options.location
                });
            }
        });

        videojs.EmbedButton.prototype.onClick = function () {
            this.overlay.toggle();
        };

        videojs.ViewOnGuardianButton = videojs.Button.extend({
            init: function (player, options) {
                videojs.Button.call(this, player, options);
            }
        });


        videojs.ViewOnGuardian = function (player) {
            var videoUrl = $('meta[itemprop=url]').attr("content"),
                videoTitle = $('meta[itemprop=name]').attr("content"),
                button = new videojs.ViewOnGuardianButton(player, {
                location: options.location,
                el: videojs.Component.prototype.createEl(null, {
                    className: 'vjs-view-on-guardian vjs-control',
                    innerHTML: '<a href="http://www.theguardian.com/' + videoUrl + '" target="_parent" class="vjs-title">' + videoTitle + '</a><a href="http://www.theguardian.com/' + videoUrl + '" target="_parent" class="vjs-control-content" data-link-name="embed-to-guardian">' + svgs('marque36icon') +'</a>',
                    role: 'button'
                })
            });
            player.controlBar.addChild(button);
        };

        player.ready(function() {
            var button = new videojs.EmbedButton(player, {
                location: options.location,
                el: videojs.Component.prototype.createEl(null, {
                    className: 'vjs-embed-button vjs-control',
                    innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">Embed</span></div>',
                    role: 'button'
                })
            });

            player.controlBar.addChild(button);
            videojs.ViewOnGuardian(player);
        });

    });
});
