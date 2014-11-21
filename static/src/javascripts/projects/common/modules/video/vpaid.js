define([
    'common/utils/_'
], function (
    _
) {
    function init(vjs) {
        /**
         * Vpaid Media Controller
         *
         * @param {vjs.Player} player
         * @param {Object=} options
         * @param {Function=} ready
         * @constructor
         */
        vjs.Vpaid = vjs.MediaTechController.extend({
            /** @constructor */
            init: function (player, options, ready) {
                vjs.MediaTechController.call(this, player, options, ready);

                var source = options['source'],

                // Which element to embed in
                    parentEl = options['parentEl'],

                // Create a temporary element to be replaced by swf object
                    placeHolder = this.el_ = vjs.createEl('div', { id: player.id() + '_temp_vpaid' }),

                // Generate ID for swf object
                    objId = player.id() + '_vpaid_api',

                // Store player options in local var for optimization
                // TODO: switch to using player methods instead of options
                // e.g. player.autoplay();
                    playerOptions = player.options_,

                // Merge default flashvars with ones passed in to init
                    flashVars = vjs.obj.merge({

                        // SWF Callback Functions
                        'readyFunction': 'videojs.Vpaid.onReady',
                        'eventProxyFunction': 'videojs.Vpaid.onEvent',
                        'errorEventProxyFunction': 'videojs.Vpaid.onError',

                        // Player Settings
                        'autoplay': playerOptions.autoplay,
                        'preload': playerOptions.preload,
                        'loop': playerOptions.loop,
                        'muted': playerOptions.muted

                    }, options['flashVars']),

                // Merge default parames with ones passed in
                    params = vjs.obj.merge({
                        'wmode': 'opaque', // Opaque is needed to overlay controls, but can affect playback performance
                        'bgcolor': '#000000' // Using bgcolor prevents a white flash when the object is loading
                    }, options['params']),

                // Merge default attributes with ones passed in
                    attributes = vjs.obj.merge({
                        'id': objId,
                        'name': objId, // Both ID and Name needed or swf to identifty itself
                        'class': 'vjs-tech'
                    }, options['attributes'])
                    ;

                // Add placeholder to player div
                vjs.insertFirst(placeHolder, parentEl);

                // Having issues with Flash reloading on certain page actions (hide/resize/fullscreen) in certain browsers
                // This allows resetting the playhead when we catch the reload
                if (options['startTime']) {
                    this.ready(function () {
                        this.load();
                        this.play();
                        this['currentTime'](options['startTime']);
                    });
                }

                // firefox doesn't bubble mousemove events to parent. videojs/video-js-swf#37
                // bugzilla bug: https://bugzilla.mozilla.org/show_bug.cgi?id=836786
                if (vjs.IS_FIREFOX) {
                    this.ready(function () {
                        vjs.on(this.el(), 'mousemove', vjs.bind(this, function () {
                            // since it's a custom event, don't bubble higher than the player
                            this.player().trigger({ 'type': 'mousemove', 'bubbles': false });
                        }));
                    });
                }

                // native click events on the SWF aren't triggered on IE11, Win8.1RT
                // use stageclick events triggered from inside the SWF instead
                player.on('stageclick', player.reportUserActivity);

                this.el_ = vjs.Vpaid.embed(options['swf'], placeHolder, flashVars, params, attributes);

                if (source) {
                    this.ready(function () {
                        this.src(source.src);
                    });
                }
            }
        });

        vjs.Vpaid.prototype.dispose = function () {
            vjs.MediaTechController.prototype.dispose.call(this);
        };

        vjs.Vpaid.prototype.play = function () {
            this.el_.vjs_play();
        };

        vjs.Vpaid.prototype.pause = function () {
            this.el_.vjs_pause();
        };

        vjs.Vpaid.prototype.src = function (src) {
            if (src === undefined) {
                return this['currentSrc']();
            }

            // A dependency on the vast plugin. Retrieve the source object for the requested src,
            // and pass properties into the player.
            if (this.player_.vast && this.player_.vast.sources) {
                var sourceObject = _.find(this.player_.vast.sources, vjs.bind(this, function(srcObj) {
                    return srcObj.src === src;
                }));

                if (sourceObject) {
                    this.el_.vjs_setProperty('adParameters', sourceObject.adParameters);
                    this.el_.vjs_setProperty('duration', sourceObject.duration);
                    this.el_.vjs_setProperty('bitrate', sourceObject.bitrate);
                    this.el_.vjs_setProperty('width', sourceObject.bitrate);
                    this.el_.vjs_setProperty('height', sourceObject.bitrate);
                }
            }

            // Make sure source URL is absolute.
            src = vjs.getAbsoluteURL(src);
            this.el_.vjs_src(src);

            // Currently the SWF doesn't autoplay if you load a source later.
            // e.g. Load player w/ no source, wait 2s, set src.
            if (this.player_.autoplay()) {
                var tech = this;
                setTimeout(function () {
                    tech.play();
                }, 0);
            }
        };

        vjs.Vpaid.prototype['setCurrentTime'] = function (time) {
            this.lastSeekTarget_ = time;
            this.el_.vjs_setProperty('currentTime', time);
            vjs.MediaTechController.prototype.setCurrentTime.call(this);
        };

        vjs.Vpaid.prototype['currentTime'] = function (time) {
            // when seeking make the reported time keep up with the requested time
            // by reading the time we're seeking to
            if (this.seeking()) {
                return this.lastSeekTarget_ || 0;
            }
            return this.el_.vjs_getProperty('currentTime');
        };

        vjs.Vpaid.prototype['currentSrc'] = function () {
            return this.el_.vjs_getProperty('currentSrc');
        };

        vjs.Vpaid.prototype.load = function () {
            this.el_.vjs_load();
        };

        vjs.Vpaid.prototype.poster = function () {
            this.el_.vjs_getProperty('poster');
        };
        vjs.Vpaid.prototype['setPoster'] = function () {
            // poster images are not handled by the Flash tech so make this a no-op
        };

        vjs.Vpaid.prototype.buffered = function () {
            return vjs.createTimeRange(0, this.el_.vjs_getProperty('buffered'));
        };

        vjs.Vpaid.prototype.supportsFullScreen = function () {
            return false; // Flash does not allow fullscreen through javascript
        };

        vjs.Vpaid.prototype.enterFullScreen = function () {
            return false;
        };

        (function () {
            // Create setters and getters for attributes
            var api = vjs.Vpaid.prototype,
                readWrite = 'preload,defaultPlaybackRate,playbackRate,autoplay,loop,mediaGroup,controller,controls,volume,muted,defaultMuted'.split(','),
                readOnly = 'error,networkState,readyState,seeking,initialTime,duration,startOffsetTime,paused,played,seekable,ended,videoTracks,audioTracks,videoWidth,videoHeight,textTracks'.split(','),
            // Overridden: buffered, currentTime, currentSrc
                i;

            function createSetter(attr) {
                var attrUpper = attr.charAt(0).toUpperCase() + attr.slice(1);
                api['set' + attrUpper] = function (val) {
                    return this.el_.vjs_setProperty(attr, val);
                };
            };
            function createGetter(attr) {
                api[attr] = function () {
                    return this.el_.vjs_getProperty(attr);
                };
            };

            // Create getter and setters for all read/write attributes
            for (i = 0; i < readWrite.length; i++) {
                createGetter(readWrite[i]);
                createSetter(readWrite[i]);
            }

            // Create getters for read-only attributes
            for (i = 0; i < readOnly.length; i++) {
                createGetter(readOnly[i]);
            }
        })();

        /* Flash Support Testing -------------------------------------------------------- */

        vjs.Vpaid.isSupported = function () {
            return vjs.Vpaid.version()[0] >= 10;
        };

        vjs.Vpaid.canPlaySource = function (srcObj) {
            var type;

            if (!srcObj.type) {
                return '';
            }

            type = srcObj.type.replace(/;.*/, '').toLowerCase();
            if (type in vjs.Vpaid.formats) {
                return 'maybe';
            }
        };

        vjs.Vpaid.formats = {
            'application/x-shockwave-flash': 'SWF'
        };

        vjs.Vpaid['onReady'] = function (currSwf) {
            var el, player;

            el = vjs.el(currSwf);

            // get player from the player div property
            player = el && el.parentNode && el.parentNode['player'];

            // if there is no el or player then the tech has been disposed
            // and the tech element was removed from the player div
            if (player) {
                // reference player on tech element
                el['player'] = player;
                // check that the flash object is really ready
                vjs.Vpaid['checkReady'](player.tech);
            }
        };

        // The SWF isn't always ready when it says it is. Sometimes the API functions still need to be added to the object.
        // If it's not ready, we set a timeout to check again shortly.
        vjs.Vpaid['checkReady'] = function (tech) {
            // stop worrying if the tech has been disposed
            if (!tech.el()) {
                return;
            }

            // check if API property exists
            if (tech.el().vjs_getProperty) {
                // tell tech it's ready
                tech.triggerReady();
            } else {
                // wait longer
                setTimeout(function () {
                    vjs.Vpaid['checkReady'](tech);
                }, 50);
            }
        };

        // Trigger events from the swf on the player
        vjs.Vpaid['onEvent'] = function (swfID, eventName) {
            var player = vjs.el(swfID)['player'];
            player.trigger(eventName);
        };

        // Log errors from the swf
        vjs.Vpaid['onError'] = function (swfID, err) {
            var player = vjs.el(swfID)['player'];
            var msg = 'Vpaid: ' + err;

            if (err == 'srcnotfound') {
                player.error({ code: 4, message: msg });

                // errors we haven't categorized into the media errors
            } else {
                player.error(msg);
            }
        };

        // Flash Version Check
        vjs.Vpaid.version = function () {
            var version = '0,0,0';

            // IE
            try {
                version = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version').replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];

                // other browsers
            } catch (e) {
                try {
                    if (navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                        version = (navigator.plugins['Shockwave Flash 2.0'] || navigator.plugins['Shockwave Flash']).description.replace(/\D+/g, ',').match(/^,?(.+),?$/)[1];
                    }
                } catch (err) {
                }
            }
            return version.split(',');
        };

        // Flash embedding method. Only used in non-iframe mode
        vjs.Vpaid.embed = function (swf, placeHolder, flashVars, params, attributes) {
            var code = vjs.Vpaid.getEmbedCode(swf, flashVars, params, attributes),

            // Get element by embedding code and retrieving created element
                obj = vjs.createEl('div', { innerHTML: code }).childNodes[0],

                par = placeHolder.parentNode
                ;

            placeHolder.parentNode.replaceChild(obj, placeHolder);

            // IE6 seems to have an issue where it won't initialize the swf object after injecting it.
            // This is a dumb fix
            var newObj = par.childNodes[0];
            setTimeout(function () {
                newObj.style.display = 'block';
            }, 1000);

            return obj;

        };

        vjs.Vpaid.getEmbedCode = function (swf, flashVars, params, attributes) {

            var objTag = '<object type="application/x-shockwave-flash"',
                flashVarsString = '',
                paramsString = '',
                attrsString = '';

            // Convert flash vars to string
            if (flashVars) {
                vjs.obj.each(flashVars, function (key, val) {
                    flashVarsString += (key + '=' + val + '&amp;');
                });
            }

            // Add swf, flashVars, and other default params
            params = vjs.obj.merge({
                'movie': swf,
                'flashvars': flashVarsString,
                'allowScriptAccess': 'always', // Required to talk to swf
                'allowNetworking': 'all' // All should be default, but having security issues.
            }, params);

            // Create param tags string
            vjs.obj.each(params, function (key, val) {
                paramsString += '<param name="' + key + '" value="' + val + '" />';
            });

            attributes = vjs.obj.merge({
                // Add swf to attributes (need both for IE and Others to work)
                'data': swf,

                // Default to 100% width/height
                'width': '100%',
                'height': '100%'

            }, attributes);

            // Create Attributes string
            vjs.obj.each(attributes, function (key, val) {
                attrsString += (key + '="' + val + '" ');
            });

            return objTag + attrsString + '>' + paramsString + '</object>';
        };
    }

    return {
        init: init
    }
});
