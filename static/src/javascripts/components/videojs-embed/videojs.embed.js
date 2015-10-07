"use strict";
(function(factory) {
    /*!
     * Custom Universal Module Definition (UMD)
     *
     * Video.js will never be a non-browser lib so we can simplify UMD a bunch and
     * still support requirejs and browserify. This also needs to be closure
     * compiler compatible, so string keys are used.
     */
    if (typeof define === 'function' && define['amd']) {
        define(['./video'], function (vjs) {
            factory(vjs)
        });
// checking that module is an object too because of umdjs/umd#35
    } else if (typeof exports === 'object' && typeof module === 'object') {
        factory(require('video.js'));
    } else {
        factory(videojs);
    }
})(function(videojs){

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
});
