var
  video,
  oldSetTimeout,
  oldClearImmediate,
  player;

module('Ad Framework', {
  setup: function() {
    // fake out Html5 support
    videojs.Html5.isSupported = function() {
      return true;
    };

    video = document.createElement('video');
    video.poster = '//example.com/poster.jpg';
    video.load = function() {};
    video.play = function() {};

    // phantom has a non-functional version of removeAttribute
    if (/phantom/i.test(window.navigator.userAgent)) {
      video.removeAttribute = function(attr) {
        video[attr] = '';
      };
    }

    document.getElementById('qunit-fixture').appendChild(video);
    player = videojs(video);
    player.buffered = function() {
      return videojs.createTimeRange(0, 0);
    };
    video = player.el().querySelector('.vjs-tech');
    player.ads();

    // make setImmediate synchronous
    window.setImmediate = function(callback) {
      callback.call(window);
    };

    // save clearImmediate so it can be restored after tests run
    oldClearImmediate = window.clearImmediate;
  },
  teardown: function() {
    window.clearImmediate = oldClearImmediate;
  }
});

test('the environment is sane', function() {
  ok(true, 'true is ok');
});

test('begins in content-set', function() {
  equal(player.ads.state, 'content-set');
});

test('pauses to wait for prerolls when the plugin loads before play', function() {
  var pauses = 0;
  player.pause = function() {
    pauses++;
  };
  player.paused = function() {
    return false;
  };

  player.trigger('adsready');
  player.trigger('play');
  player.trigger('play');

  equal(2, pauses, 'play attempts are paused');
});

test('pauses to wait for prerolls when the plugin loads after play', function() {
  var pauses = 0;
  player.pause = function() {
    pauses++;
  };
  player.paused = function() {
    return false;
  };

  player.trigger('play');
  player.trigger('play');

  equal(2, pauses, 'play attempts are paused');
});

test('stops canceling play events when an ad is playing', function() {
  var callback;
  expect(3);
  // capture setImmediate callbacks to manipulate invocation order
  window.setImmediate = function(cb) {
    callback = cb;
    return 1;
  };
  window.clearImmediate = function(id) {
    callback = null;
    equal(player.ads.cancelPlayTimeout,
          id,
          'the cancel-play timeout is cancelled');
  };

  player.trigger('play');
  player.trigger('adsready');
  equal(1, player.ads.cancelPlayTimeout, 'a cancel-play is scheduled');

  player.trigger('adstart');
  equal(player.ads.state, 'ad-playback', 'ads are playing');
});

test('adstart is fired before a preroll', function() {
  var adStarts = 0;
  player.on('adstart', function() {
    adStarts++;
  });

  player.trigger('adsready');
  player.trigger('play');
  player.ads.startLinearAdMode();
  equal(1, adStarts, 'a preroll triggers adstart');
});

test('moves to content-playback after a preroll', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adstart');
  player.trigger('adend');
  equal(player.ads.state,
        'content-playback',
        'the state is content-playback');
});

test('moves to ad-playback if a midroll is requested', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adtimeout');
  player.trigger('adstart');
  equal(player.ads.state, 'ad-playback', 'the state is ad-playback');
});

test('moves to content-playback if the preroll times out', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adtimeout');
  equal(player.ads.state,
        'content-playback',
        'the state is content-playback');
});

test('waits for adsready if play is received first', function() {
  player.trigger('play');
  player.trigger('adsready');
  equal(player.ads.state, 'preroll?', 'the state is preroll?');
});

test('moves to ad-timeout-playback if a plugin does not finish initializing', function() {
  player.trigger('play');
  player.trigger('adtimeout');
  equal(player.ads.state,
        'ad-timeout-playback',
        'the state is ad-timeout-playback');
});

test('calls start immediately on play when ads are ready', function() {
  var prerolls = 0;
  player.on('readyforpreroll', function() {
    prerolls++;
  });
  player.trigger('adsready');
  player.trigger('play');
  equal(1, prerolls, 'readyforpreroll was fired');
});

test('adds the ad-mode class when a preroll plays', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adstart');

  ok(player.el().className.indexOf('vjs-ad-playing') >= 0,
     'the ad class should be in "' + player.el().className + '"');
});

test('removes the ad-mode class when a preroll finishes', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.ads.startLinearAdMode();
  player.ads.endLinearAdMode();

  ok(player.el().className.indexOf('vjs-ad-playing') < 0,
     'the ad class should not be in "' + player.el().className + '"');
});

test('adds a class while waiting for an ad plugin to load', function() {
  player.trigger('play');
  
  ok(player.el().className.indexOf('vjs-ad-loading') >= 0,
     'the ad loading class should be in "' + player.el().className + '"');
});

test('adds a class while waiting for a preroll', function() {
  player.trigger('adsready');
  player.trigger('play');
  
  ok(player.el().className.indexOf('vjs-ad-loading') >= 0,
     'the ad loading class should be in "' + player.el().className + '"');
});

test('removes the loading class when the preroll begins', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adstart');

  ok(player.el().className.indexOf('vjs-ad-loading') < 0,
     'there should be no ad loading class present');
});

test('removes the loading class when the preroll times out', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adtimeout');

  ok(player.el().className.indexOf('vjs-ad-loading') < 0,
     'there should be no ad loading class present');
});

test('starts the content video if there is no preroll', function() {
  var playCount = 0;
  player.play = function() {
    playCount++;
  };
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adtimeout');

  equal(1, playCount, 'play is called once');
});

test('removes the poster attribute so it does not flash between videos', function() {
  ok(video.poster, 'the poster is present initially');

  player.trigger('adsready');
  player.trigger('play');

  equal(video.poster, '', 'poster is removed');
});

test('restores the poster attribute after ads have ended', function() {
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adstart');
  player.trigger('adend');

  ok(video.poster, 'the poster is restored');
});

test('changing the src triggers contentupdate', function() {
  
  // track contentupdate events
  var contentupdates = 0;
  player.on('contentupdate', function(){
    contentupdates++;
  });
  
  // set src and trigger synthetic 'loadstart'
  player.src('http://media.w3.org/2010/05/sintel/trailer.mp4');
  player.trigger('loadstart');

  // confirm one contentupdate event
  equal(contentupdates, 1, 'one contentupdate event fired');
  
});

test('changing src does not trigger contentupdate during ad playback', function() {
  
  // track contentupdate events
  var contentupdates = 0;
  player.on('contentupdate', function(){
    contentupdates++;
  });
  
  // enter ad playback mode
  player.trigger('adsready');
  player.trigger('play');
  player.trigger('adstart');
  
  // set src and trigger synthetic 'loadstart'
  player.src('http://media.w3.org/2010/05/sintel/trailer.mp4');
  player.trigger('loadstart');
  
  // finish playing ad
  player.trigger('adend');
  
  // confirm one contentupdate event
  equal(contentupdates, 0, 'no contentupdate events fired');
  
});


test('the cancel-play timeout is cleared when exiting "preroll?"', function() {
  var callbacks = [];
  expect(3);

  // capture setImmediate callbacks to manipulate invocation order
  window.setImmediate = function(callback) {
    callbacks.push(callback);
    return callbacks.length;
  };

  player.trigger('adsready');
  player.trigger('play');

  equal('preroll?', player.ads.state, 'the player is waiting for prerolls');

  player.trigger('play');
  equal(1, callbacks.length, 'a single cancel-play is registered');

  callbacks[0](); // run the cancel-play
  callbacks.length = 0;

  player.trigger('play');
  player.trigger('play');
  player.trigger('play');
  equal(1, callbacks.length, 'a single cancel-play is registered');
});

module('Ad Framework - Video Snapshot', {
  setup: function() {
    var noop = function() {};
    video = document.createElement('div');
    player = videojs(video);
    player.buffered = function() {
      return videojs.createTimeRange(0, 0);
    };

    video.load = noop;
    video.play = noop;
    player.ads();

    // save the original setTimeout
    oldSetTimeout = window.setTimeout;
  },

  teardown: function() {
    window.setTimeout = oldSetTimeout;
  }
});

test('restores the original video src after ads', function() {
  var originalSrc = player.currentSrc();

  player.trigger('adsready');
  player.trigger('play');

  player.trigger('adstart');
  player.src('//example.com/ad.mp4');
  player.trigger('adend');

  equal(originalSrc, player.currentSrc(), 'the original src is restored');
});

test('waits for the video to become seekable before restoring the time', function() {
  expect(2);

  var timeouts = 0;

  window.setTimeout = function() {
    timeouts++;
  };

  video.seekable = [];

  player.trigger('adsready');
  player.trigger('play');

  // the video plays to time 100
  timeouts = 0;
  video.currentTime = 100;
  player.trigger('adstart');
  player.src('//example.com/ad.mp4');

  // the ad resets the current time
  video.currentTime = 0;
  player.trigger('adend');
  player.trigger('loadedmetadata');

  equal(1, timeouts, 'restoring the time should be delayed');
  equal(0, video.currentTime, 'currentTime is not modified');
});

test('tries to restore the play state up to 20 times', function() {
  expect(1);

  var timeouts = 0;

  // immediately execute all timeouts
  window.setTimeout = function(callback) {
    timeouts++;
    callback();
  };

  video.seekable = [];

  player.trigger('adsready');
  player.trigger('play');

  // the video plays to time 100
  timeouts = 0;
  video.currentTime = 100;
  player.trigger('adstart');
  player.src('//example.com/ad.mp4');

  // the ad resets the current time
  video.currentTime = 0;
  player.trigger('adend');
  player.trigger('loadedmetadata');

  equal(20, timeouts, 'seekable was tried multiple times');
});

test('the current time is restored at the end of an ad', function() {
  expect(1);

  player.trigger('adsready');
  video.currentTime = 100;
  player.trigger('play');

  // the video plays to time 100
  player.trigger('adstart');
  player.src('//exampe.com/ad.mp4');

  // the ad resets the current time
  video.currentTime = 0;
  player.trigger('adend');
  player.trigger('loadedmetadata');

  equal(100, video.currentTime, 'currentTime was restored');
});

test('only restores the player snapshot if the src changed', function() {
  var
    playCalled = false,
    srcModified = false,
    currentTimeModified = false;

  player.trigger('adsready');
  player.trigger('play');

  // spy on relevant player methods
  player.play = function() {
    playCalled = true;
  };
  player.src = function(url) {
    if (url === undefined) {
      return video.src;
    }
    srcModified = true;
  };
  player.currentTime = function() {
    currentTimeModified = true;
  };

  // with a separate video display or server-side ad insertion, ads play but
  // the src never changes. Modifying the src or currentTime would introduce
  // unnecessary seeking and rebuffering
  player.trigger('adstart');
  player.trigger('adend');

  ok(!srcModified, 'the src was not set');
  ok(playCalled, 'content playback resumed');

  // the src wasn't changed, so we shouldn't be waiting on loadedmetadata to
  // update the currentTime
  player.trigger('loadedmetadata');
  ok(!currentTimeModified, 'no seeking occurred');
});
