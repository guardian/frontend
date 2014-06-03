/**
 * Basic Ad support plugin for video.js.
 *
 * Common code to support ad integrations.
 */
(function(window, document, vjs, undefined) {
"use strict";

var
  
  /**
   * Copies properties from one or more objects onto an original.
   */
  extend = function(obj /*, arg1, arg2, ... */) {
    var arg, i, k;
    for (i=1; i<arguments.length; i++) {
      arg = arguments[i];
      for (k in arg) {
        if (arg.hasOwnProperty(k)) {
          obj[k] = arg[k];
        }
      }
    }
    return obj;
  },
  
  /**
   * Add a handler for multiple listeners to an object that supports addEventListener() or on().
   *
   * @param {object} obj The object to which the handler will be assigned.
   * @param {mixed} events A string, array of strings, or hash of string/callback pairs.
   * @param {function} callback Invoked when specified events occur, if events param is not a hash.
   *
   * @return {object} obj The object passed in.
   */
  on = function(obj, events, handler) {
    
    var
      
      type = Object.prototype.toString.call(events),
      
      register = function(obj, event, handler) {
        if (obj.addEventListener) {
          obj.addEventListener(event, handler);
        } else if (obj.on) {
          obj.on(event, handler);
        } else if (obj.attachEvent) {
          obj.attachEvent('on' + event, handler);
        } else {
          throw new Error('object has no mechanism for adding event listeners');
        }
      },
      
      i,
      ii;
    
    switch (type) {
      case '[object String]':
        register(obj, events, handler);
        break;
      case '[object Array]':
        for (i = 0, ii = events.length; i<ii; i++) {
          register(obj, events[i], handler);
        }
        break;
      case '[object Object]':
        for (i in events) {
          if (events.hasOwnProperty(i)) {
            register(obj, i, events[i]);
          }
        }
        break;
      default:
        throw new Error('Unrecognized events parameter type: ' + type);
    }
    
    return obj;
    
  },
  
  /**
   * Runs the callback at the next available opportunity.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/window.setImmediate
   */
  setImmediate = function(callback) {
    return (
      window.setImmediate ||
      window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.setTimeout
    )(callback, 0);
  },

  /**
   * Clears a callback previously registered with `setImmediate`.
   * @param {id} id The identifier of the callback to abort
   */
  clearImmediate = function(id) {
    return (window.clearImmediate ||
            window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.clearTimeout)(id);
  },

  /**
   * If ads are not playing, pauses the player at the next available
   * opportunity. Has no effect if ads have started. This function is necessary
   * because pausing a video element while processing a `play` event on iOS can
   * cause the video element to continuously toggle between playing and paused
   * states.
   *
   * @param {object} player The video player
   */
  cancelContentPlay = function(player) {
    if (player.ads.cancelPlayTimeout) {
      // another cancellation is already in flight, so do nothing
      return;
    }

    player.ads.cancelPlayTimeout = setImmediate(function() {

      // deregister the cancel timeout so subsequent cancels are scheduled
      player.ads.cancelPlayTimeout = null;

      if (!player.paused()) {
        player.pause();
      }
    });
  },
  
  /**
   * Returns an object that captures the portions of player state relevant to
   * video playback. The result of this function can be passed to
   * restorePlayerSnapshot with a player to return the player to the state it
   * was in when this function was invoked.
   * @param {object} player The videojs player object
   */
  getPlayerSnapshot = function(player) {
    var
      tech = player.el().querySelector('.vjs-tech'),
      snapshot = {
        src: player.currentSrc(),
        currentTime: player.currentTime(),

        // on slow connections, player.paused() may be true when starting and
        // stopping ads even though play has been requested. Hard-coding the
        // playback state works for the purposes of ad playback but makes this
        // an inaccurate snapshot.
        play: true
      };

    if (tech) {
      snapshot.nativePoster = tech.poster;
    }

    return snapshot;
  },

  removeClass = function(element, className) {
    var
      classes = element.className.split(/\s+/),
      i = classes.length,
      newClasses = [];
    while (i--) {
      if (classes[i] !== className) {
        newClasses.push(classes[i]);
      }
    }
    element.className = newClasses.join(' ');
  },

  /**
   * Attempts to modify the specified player so that its state is equivalent to
   * the state of the snapshot.
   * @param {object} snapshot - the player state to apply
   */
  restorePlayerSnapshot = function(player, snapshot) {
    var
      // the playback tech
      tech = player.el().querySelector('.vjs-tech'),

      // the number of remaining attempts to restore the snapshot
      attempts = 20,

      // finish restoring the playback state
      resume = function() {
        player.currentTime(snapshot.currentTime);
        if (snapshot.play) {
          player.play();
        }
      },

      // determine if the video element has loaded enough of the snapshot source
      // to be ready to apply the rest of the state
      tryToResume = function() {
        if (tech.seekable === undefined) {
          // if the tech doesn't expose the seekable time ranges, try to
          // resume playback immediately
          resume();
          return;
        }
        if (tech.seekable.length > 0) {
          // if some period of the video is seekable, resume playback
          resume();
          return;
        }
        
        // delay a bit and then check again unless we're out of attempts
        if (attempts--) {
          setTimeout(tryToResume, 50);
        }
      };

    if (snapshot.nativePoster) {
      tech.poster = snapshot.nativePoster;
    }

    // with a custom ad display or burned-in ads, the content player state
    // hasn't been modified and so no restoration is required
    if (player.currentSrc() === snapshot.src) {
      player.play();
      return;
    }

    player.src(snapshot.src);
    // safari requires a call to `load` to pick up a changed source
    player.load();

    player.one('loadedmetadata', tryToResume);
  },

  /**
   * Remove the poster attribute from the video element tech, if present. When
   * reusing a video element for multiple videos, the poster image will briefly
   * reappear while the new source loads. Removing the attribute ahead of time
   * prevents the poster from showing up between videos.
   * @param {object} player The videojs player object
   */
  removeNativePoster = function(player) {
    var tech = player.el().querySelector('.vjs-tech');
    if (tech) {
      tech.removeAttribute('poster');
    }
  },

  // ---------------------------------------------------------------------------
  // Ad Framework
  // ---------------------------------------------------------------------------

  // default framework settings
  defaults = {
    // maximum amount of time in ms to wait to receive `adsready` from the ad
    // implementation after play has been requested. Ad implementations are
    // expected to load any dynamic libraries and make any requests to determine
    // ad policies for a video during this time.
    timeout: 5000,

    // maximum amount of time in ms to wait for the ad implementation to start
    // linear ad mode after `readyforpreroll` has fired. This is in addition to
    // the standard timeout.
    prerollTimeout: 100,

    // when truthy, instructs the plugin to output additional information about
    // plugin state to the video.js log. On most devices, the video.js log is
    // the same as the developer console.
    debug: false
  },

  adFramework = function(options) {
    var
      player = this,

      // merge options and defaults
      settings = extend({}, defaults, options || {}),
      
      fsmHandler;
    
    // replace the ad initializer with the ad namespace
    player.ads = {
      state: 'content-set',

      startLinearAdMode: function() {
        player.trigger('adstart');
      },

      endLinearAdMode: function() {
        player.trigger('adend');
      }
    };
    
    fsmHandler = function(event) {

      // Ad Playback State Machine
      var
        fsm = {
          'content-set': {
            events: {
              'adsready': function() {
                this.state = 'ads-ready';
              },
              'play': function() {
                this.state = 'ads-ready?';
                this.snapshot = getPlayerSnapshot(player);
                cancelContentPlay(player);

                // remove the poster so it doesn't flash between videos
                removeNativePoster(player);
              }
            }
          },
          'ads-ready': {
            events: {
              'play': function() {
                this.state = 'preroll?';
                cancelContentPlay(player);
              }
            }
          },
          'preroll?': {
            enter: function() {
              
              // capture current player state snapshot (playing, currentTime, src)
              this.snapshot = getPlayerSnapshot(player);

              // remove the poster so it doesn't flash between videos
              removeNativePoster(player);
              
              // change class to show that we're waiting on ads
              player.el().className += ' vjs-ad-loading';
              
              // schedule an adtimeout event to fire if we waited too long
              player.ads.timeout = window.setTimeout(function() {
                player.trigger('adtimeout');
              }, settings.prerollTimeout);
              
              // signal to ad plugin that it's their opportunity to play a preroll
              player.trigger('readyforpreroll');
              
            },
            leave: function() {
              window.clearTimeout(player.ads.timeout);

              clearImmediate(player.ads.cancelPlayTimeout);
              player.ads.cancelPlayTimeout = null;

              removeClass(player.el(), 'vjs-ad-loading');
            },
            events: {
              'play': function() {
                cancelContentPlay(player);
              },
              'adstart': function() {
                this.state = 'ad-playback';
                player.el().className += ' vjs-ad-playing';
              },
              'adtimeout': function() {
                this.state = 'content-playback';
                player.play();
              }
            }
          },
          'ads-ready?': {
            enter: function() {
              player.el().className += ' vjs-ad-loading';
              player.ads.timeout = window.setTimeout(function() {
                player.trigger('adtimeout');
              }, settings.timeout);
            },
            leave: function() {
              window.clearTimeout(player.ads.timeout);
              removeClass(player.el(), 'vjs-ad-loading');
            },
            events: {
              'play': function() {
                cancelContentPlay(player);
              },
              'adsready': function() {
                this.state = 'preroll?';
              },
              'adtimeout': function() {
                this.state = 'ad-timeout-playback';
              }
            }
          },
          'ad-timeout-playback': {
            enter: function() {
              restorePlayerSnapshot(player, this.snapshot);
            },
            events: {
              'adsready': function() {
                if (player.paused()) {
                  this.state = 'ads-ready';
                } else {
                  this.state = 'preroll?';
                }
              },
              'contentupdate': function() {
                if (player.paused()) {
                  this.state = 'content-set';
                } else {
                  this.state = 'ads-ready?';
                }
              }
            }
          },
          'ad-playback': {
            events: {
              'adend': function() {
                this.state = 'content-playback';
                removeClass(player.el(), 'vjs-ad-playing');
                restorePlayerSnapshot(player, this.snapshot);
              }
            }
          },
          'content-playback': {
            events: {
              'adstart': function() {
                this.state = 'ad-playback';
                this.snapshot = getPlayerSnapshot(player);
                player.el().className += ' vjs-ad-playing';

                // remove the poster so it doesn't flash between videos
                removeNativePoster(player);
              },
              'contentupdate': function() {
                if (player.paused()) {
                  this.state = 'content-set';
                } else {
                  this.state = 'ads-ready?';
                }
              }
            }
          }
        };

      (function(state) {
        
        var noop = function() {};
        
        // process the current event with a noop default handler
        (fsm[state].events[event.type] || noop).apply(player.ads);
        
        // execute leave/enter callbacks if present
        if (state !== player.ads.state) {
          (fsm[state].leave || noop).apply(player.ads);
          (fsm[player.ads.state].enter || noop).apply(player.ads);

          if (settings.debug) {
            videojs.log('ads', state + ' -> ' + player.ads.state);
          }
        }
        
      })(player.ads.state);

    };

    // register for the events we're interested in
    on(player, vjs.Html5.Events.concat([
      // events emitted by ad plugin
      'adtimeout',
      'contentupdate',
      // events emitted by third party ad implementors
      'adsready',
      'adstart',  // startLinearAdMode()
      'adend',    // endLinearAdMode()
    ]), fsmHandler);
    
    // implement 'contentupdate' event.
    (function(){
      var
        // keep track of last src
        lastSrc,
        // check if a new src has been set, if so, trigger contentupdate
        checkSrc = function() {
          var src;
          if (player.ads.state !== 'ad-playback') {
            src = player.currentSrc();
            if (src !== lastSrc) {
              player.trigger({
                type: 'contentupdate',
                oldValue: lastSrc,
                newValue: src
              });
              lastSrc = src;
            }
          }
        };
      // loadstart reliably indicates a new src has been set
      player.on('loadstart', checkSrc);
      // check immediately in case we missed the loadstart
      setImmediate(checkSrc);
    })();
    
    // kick off the fsm
    if (!player.paused()) {
      // simulate a play event if we're autoplaying
      fsmHandler({type:'play'});
    }
    
  };

  // register the ad plugin framework
  vjs.plugin('ads', adFramework);

})(window, document, videojs);
