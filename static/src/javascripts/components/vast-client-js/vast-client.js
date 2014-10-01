(function(e){if("function"==typeof bootstrap)bootstrap("dmvast",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeDMVAST=e}else"undefined"!=typeof window?window.DMVAST=e():global.DMVAST=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
module.exports = {
  client: require('./client.coffee'),
  tracker: require('./tracker.coffee'),
  parser: require('./parser.coffee'),
  util: require('./util.coffee')
};

},{"./client.coffee":2,"./tracker.coffee":3,"./parser.coffee":4,"./util.coffee":5}],2:[function(require,module,exports){
var VASTClient, VASTParser, VASTUtil;

VASTParser = require('./parser.coffee');

VASTUtil = require('./util.coffee');

VASTClient = (function() {

  function VASTClient() {}

  VASTClient.cappingFreeLunch = 0;

  VASTClient.cappingMinimumTimeInterval = 0;

  VASTClient.timeout = 0;

  VASTClient.get = function(url, cb) {
    var now,
      _this = this;
    now = +new Date();
    if (this.totalCallsTimeout < now) {
      this.totalCalls = 1;
      this.totalCallsTimeout = now + (60 * 60 * 1000);
    } else {
      this.totalCalls++;
    }
    if (this.cappingFreeLunch >= this.totalCalls) {
      cb(null);
      return;
    }
    if (now - this.lastSuccessfullAd < this.cappingMinimumTimeInterval) {
      cb(null);
      return;
    }
    return VASTParser.parse(url, function(response) {
      return cb(response);
    });
  };

  (function() {
    var defineProperty, storage;
    storage = VASTUtil.storage;
    defineProperty = Object.defineProperty;
    ['lastSuccessfullAd', 'totalCalls', 'totalCallsTimeout'].forEach(function(property) {
      defineProperty(VASTClient, property, {
        get: function() {
          return storage.getItem(property);
        },
        set: function(value) {
          return storage.setItem(property, value);
        },
        configurable: false,
        enumerable: true
      });
    });
    if (VASTClient.totalCalls == null) VASTClient.totalCalls = 0;
    if (VASTClient.totalCallsTimeout == null) VASTClient.totalCallsTimeout = 0;
  })();

  return VASTClient;

})();

module.exports = VASTClient;

},{"./parser.coffee":4,"./util.coffee":5}],5:[function(require,module,exports){
var VASTUtil;

VASTUtil = (function() {

  function VASTUtil() {}

  VASTUtil.track = function(URLTemplates, variables) {
    var URL, URLs, i, _i, _len, _results;
    URLs = this.resolveURLTemplates(URLTemplates, variables);
    _results = [];
    for (_i = 0, _len = URLs.length; _i < _len; _i++) {
      URL = URLs[_i];
      if (typeof window !== "undefined" && window !== null) {
        i = new Image();
        _results.push(i.src = URL);
      } else {

      }
    }
    return _results;
  };

  VASTUtil.resolveURLTemplates = function(URLTemplates, variables) {
    var URLTemplate, URLs, macro, name, resolveURL, value, _i, _j, _len, _len2, _ref;
    URLs = [];
    if (variables == null) variables = {};
    if (!("CACHEBUSTING" in variables)) {
      variables["CACHEBUSTING"] = Math.round(Math.random() * 1.0e+10);
    }
    variables["random"] = variables["CACHEBUSTING"];
    for (_i = 0, _len = URLTemplates.length; _i < _len; _i++) {
      URLTemplate = URLTemplates[_i];
      resolveURL = URLTemplate;
      _ref = ["CACHEBUSTING", "random", "CONTENTPLAYHEAD", "ASSETURI", "ERRORCODE"];
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        name = _ref[_j];
        macro = "[" + name + "]";
        value = variables[name];
        resolveURL = resolveURL.replace(macro, value);
      }
      URLs.push(resolveURL);
    }
    return URLs;
  };

  VASTUtil.storage = (function() {
    var data, isDisabled, storage;
    try {
      storage = typeof window !== "undefined" && window !== null ? window.localStorage || window.sessionStorage : null;
    } catch (storageError) {
      storage = null;
    }
    isDisabled = function(store) {
      var testValue;
      try {
        testValue = '__VASTUtil__';
        store.setItem(testValue, testValue);
        if (store.getItem(testValue) !== testValue) return true;
      } catch (e) {
        return true;
      }
      return false;
    };
    if (!(storage != null) || isDisabled(storage)) {
      data = {};
      storage = {
        length: 0,
        getItem: function(key) {
          return data[key];
        },
        setItem: function(key, value) {
          data[key] = value;
          this.length = Object.keys(data).length;
        },
        removeItem: function(key) {
          delete data[key];
          this.length = Object.keys(data).length;
        },
        clear: function() {
          data = {};
          this.length = 0;
        }
      };
    }
    return storage;
  })();

  return VASTUtil;

})();

module.exports = VASTUtil;

},{}],6:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],7:[function(require,module,exports){
(function(process){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  if (arguments.length === 0) {
    this._events = {};
    return this;
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

})(require("__browserify_process"))
},{"__browserify_process":6}],3:[function(require,module,exports){
var EventEmitter, VASTClient, VASTCreativeLinear, VASTTracker, VASTUtil,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

VASTClient = require('./client.coffee');

VASTUtil = require('./util.coffee');

VASTCreativeLinear = require('./creative.coffee').VASTCreativeLinear;

EventEmitter = require('events').EventEmitter;

VASTTracker = (function(_super) {

  __extends(VASTTracker, _super);

  function VASTTracker(ad, creative) {
    var eventName, events, _ref;
    this.ad = ad;
    this.creative = creative;
    this.muted = false;
    this.impressed = false;
    this.skipable = false;
    this.skipDelayDefault = -1;
    this.trackingEvents = {};
    this.emitAlwaysEvents = ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'rewind', 'skip', 'closeLinear', 'close'];
    _ref = creative.trackingEvents;
    for (eventName in _ref) {
      events = _ref[eventName];
      this.trackingEvents[eventName] = events.slice(0);
    }
    if (creative instanceof VASTCreativeLinear) {
      this.assetDuration = creative.duration;
      this.quartiles = {
        'firstQuartile': Math.round(25 * this.assetDuration) / 100,
        'midpoint': Math.round(50 * this.assetDuration) / 100,
        'thirdQuartile': Math.round(75 * this.assetDuration) / 100
      };
      this.skipDelay = creative.skipDelay;
      this.linear = true;
      this.clickThroughURLTemplate = creative.videoClickThroughURLTemplate;
      this.clickTrackingURLTemplate = creative.videoClickTrackingURLTemplate;
    } else {
      this.skipDelay = -1;
      this.linear = false;
    }
    this.on('start', function() {
      VASTClient.lastSuccessfullAd = +new Date();
    });
  }

  VASTTracker.prototype.setProgress = function(progress) {
    var eventName, events, percent, quartile, skipDelay, time, _i, _len, _ref;
    skipDelay = this.skipDelay === null ? this.skipDelayDefault : this.skipDelay;
    if (skipDelay !== -1 && !this.skipable) {
      if (skipDelay > progress) {
        this.emit('skip-countdown', skipDelay - progress);
      } else {
        this.skipable = true;
        this.emit('skip-countdown', 0);
      }
    }
    if (this.linear && this.assetDuration > 0) {
      events = [];
      if (progress > 0) {
        events.push("start");
        percent = Math.round(progress / this.assetDuration * 100);
        events.push("progress-" + percent + "%");
        _ref = this.quartiles;
        for (quartile in _ref) {
          time = _ref[quartile];
          if ((time <= progress && progress <= (time + 1))) events.push(quartile);
        }
      }
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        eventName = events[_i];
        this.track(eventName, true);
      }
      if (progress < this.progress) this.track("rewind");
    }
    return this.progress = progress;
  };

  VASTTracker.prototype.setMuted = function(muted) {
    if (this.muted !== muted) this.track(muted ? "muted" : "unmuted");
    return this.muted = muted;
  };

  VASTTracker.prototype.setPaused = function(paused) {
    if (this.paused !== paused) this.track(paused ? "pause" : "resume");
    return this.paused = paused;
  };

  VASTTracker.prototype.setFullscreen = function(fullscreen) {
    if (this.fullscreen !== fullscreen) {
      this.track(fullscreen ? "fullscreen" : "exitFullscreen");
    }
    return this.fullscreen = fullscreen;
  };

  VASTTracker.prototype.setSkipDelay = function(duration) {
    if (typeof duration === 'number') return this.skipDelay = duration;
  };

  VASTTracker.prototype.load = function() {
    if (!this.impressed) {
      this.impressed = true;
      this.trackURLs(this.ad.impressionURLTemplates);
      return this.track("creativeView");
    }
  };

  VASTTracker.prototype.errorWithCode = function(errorCode) {
    return this.trackURLs(this.ad.errorURLTemplates, {
      ERRORCODE: errorCode
    });
  };

  VASTTracker.prototype.complete = function() {
    return this.track("complete");
  };

  VASTTracker.prototype.stop = function() {
    return this.track(this.linear ? "closeLinear" : "close");
  };

  VASTTracker.prototype.skip = function() {
    this.track("skip");
    return this.trackingEvents = [];
  };

  VASTTracker.prototype.click = function() {
    var clickThroughURL, variables;
    if (this.clickTrackingURLTemplate != null) {
      this.trackURLs([this.clickTrackingURLTemplate]);
    }
    if (this.clickThroughURLTemplate != null) {
      if (this.linear) {
        variables = {
          CONTENTPLAYHEAD: this.progressFormated()
        };
      }
      clickThroughURL = VASTUtil.resolveURLTemplates([this.clickThroughURLTemplate], variables)[0];
      return this.emit("clickthrough", clickThroughURL);
    }
  };

  VASTTracker.prototype.track = function(eventName, once) {
    var idx, trackingURLTemplates;
    if (once == null) once = false;
    if (eventName === 'closeLinear' && (!(this.trackingEvents[eventName] != null) && (this.trackingEvents['close'] != null))) {
      eventName = 'close';
    }
    trackingURLTemplates = this.trackingEvents[eventName];
    idx = this.emitAlwaysEvents.indexOf(eventName);
    if (trackingURLTemplates != null) {
      this.emit(eventName, '');
      this.trackURLs(trackingURLTemplates);
    } else if (idx !== -1) {
      this.emit(eventName, '');
    }
    if (once === true) {
      delete this.trackingEvents[eventName];
      if (idx > -1) this.emitAlwaysEvents.splice(idx, 1);
    }
  };

  VASTTracker.prototype.trackURLs = function(URLTemplates, variables) {
    if (variables == null) variables = {};
    if (this.linear) variables["CONTENTPLAYHEAD"] = this.progressFormated();
    return VASTUtil.track(URLTemplates, variables);
  };

  VASTTracker.prototype.progressFormated = function() {
    var h, m, ms, s, seconds;
    seconds = parseInt(this.progress);
    h = seconds / (60 * 60);
    if (h.length < 2) h = "0" + h;
    m = seconds / 60 % 60;
    if (m.length < 2) m = "0" + m;
    s = seconds % 60;
    if (s.length < 2) s = "0" + m;
    ms = parseInt((this.progress - seconds) * 100);
    return "" + h + ":" + m + ":" + s + "." + ms;
  };

  return VASTTracker;

})(EventEmitter);

module.exports = VASTTracker;

},{"events":7,"./client.coffee":2,"./util.coffee":5,"./creative.coffee":8}],4:[function(require,module,exports){
var URLHandler, VASTAd, VASTCreativeLinear, VASTMediaFile, VASTParser, VASTResponse, VASTUtil,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

URLHandler = require('./urlhandler.coffee');

VASTResponse = require('./response.coffee');

VASTAd = require('./ad.coffee');

VASTUtil = require('./util.coffee');

VASTCreativeLinear = require('./creative.coffee').VASTCreativeLinear;

VASTMediaFile = require('./mediafile.coffee');

VASTParser = (function() {
  var URLTemplateFilters;

  function VASTParser() {}

  URLTemplateFilters = [];

  VASTParser.addURLTemplateFilter = function(func) {
    if (typeof func === 'function') URLTemplateFilters.push(func);
  };

  VASTParser.removeURLTemplateFilter = function() {
    return URLTemplateFilters.pop();
  };

  VASTParser.countURLTemplateFilters = function() {
    return URLTemplateFilters.length;
  };

  VASTParser.clearUrlTemplateFilters = function() {
    return URLTemplateFilters = [];
  };

  VASTParser.parse = function(url, cb) {
    return this._parse(url, null, function(err, response) {
      return cb(response);
    });
  };

  VASTParser._parse = function(url, parentURLs, cb) {
    var filter, _i, _len,
      _this = this;
    for (_i = 0, _len = URLTemplateFilters.length; _i < _len; _i++) {
      filter = URLTemplateFilters[_i];
      url = filter(url);
    }
    if (parentURLs == null) parentURLs = [];
    parentURLs.push(url);
    return URLHandler.get(url, function(err, xml) {
      var ad, complete, loopIndex, node, response, _j, _k, _len2, _len3, _ref, _ref2;
      if (err != null) return cb(err);
      response = new VASTResponse();
      if (!(((xml != null ? xml.documentElement : void 0) != null) && xml.documentElement.nodeName === "VAST")) {
        return cb();
      }
      _ref = xml.documentElement.childNodes;
      for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
        node = _ref[_j];
        if (node.nodeName === 'Error') {
          response.errorURLTemplates.push(node.textContent);
        }
      }
      _ref2 = xml.documentElement.childNodes;
      for (_k = 0, _len3 = _ref2.length; _k < _len3; _k++) {
        node = _ref2[_k];
        if (node.nodeName === 'Ad') {
          ad = _this.parseAdElement(node);
          if (ad != null) {
            response.ads.push(ad);
          } else {
            VASTUtil.track(response.errorURLTemplates, {
              ERRORCODE: 101
            });
          }
        }
      }
      complete = function() {
        var ad, _l, _len4, _ref3;
        if (!response) return;
        _ref3 = response.ads;
        for (_l = 0, _len4 = _ref3.length; _l < _len4; _l++) {
          ad = _ref3[_l];
          if (ad.nextWrapperURL != null) return;
        }
        if (response.ads.length === 0) {
          VASTUtil.track(response.errorURLTemplates, {
            ERRORCODE: 303
          });
          response = null;
        }
        return cb(null, response);
      };
      loopIndex = response.ads.length;
      while (loopIndex--) {
        ad = response.ads[loopIndex];
        if (ad.nextWrapperURL == null) continue;
        (function(ad) {
          var baseURL, _ref3;
          if (parentURLs.length >= 10 || (_ref3 = ad.nextWrapperURL, __indexOf.call(parentURLs, _ref3) >= 0)) {
            VASTUtil.track(ad.errorURLTemplates, {
              ERRORCODE: 302
            });
            response.ads.splice(response.ads.indexOf(ad), 1);
            complete();
            return;
          }
          if (ad.nextWrapperURL.indexOf('://') === -1) {
            baseURL = url.slice(0, url.lastIndexOf('/'));
            ad.nextWrapperURL = "" + baseURL + "/" + ad.nextWrapperURL;
          }
          return _this._parse(ad.nextWrapperURL, parentURLs, function(err, wrappedResponse) {
            var creative, eventName, index, wrappedAd, _base, _l, _len4, _len5, _len6, _m, _n, _ref4, _ref5, _ref6;
            if (err != null) {
              VASTUtil.track(ad.errorURLTemplates, {
                ERRORCODE: 301
              });
              response.ads.splice(response.ads.indexOf(ad), 1);
            } else if (!(wrappedResponse != null)) {
              VASTUtil.track(ad.errorURLTemplates, {
                ERRORCODE: 303
              });
              response.ads.splice(response.ads.indexOf(ad), 1);
            } else {
              response.errorURLTemplates = response.errorURLTemplates.concat(wrappedResponse.errorURLTemplates);
              index = response.ads.indexOf(ad);
              response.ads.splice(index, 1);
              _ref4 = wrappedResponse.ads;
              for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
                wrappedAd = _ref4[_l];
                wrappedAd.errorURLTemplates = ad.errorURLTemplates.concat(wrappedAd.errorURLTemplates);
                wrappedAd.impressionURLTemplates = ad.impressionURLTemplates.concat(wrappedAd.impressionURLTemplates);
                if (ad.trackingEvents != null) {
                  _ref5 = wrappedAd.creatives;
                  for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
                    creative = _ref5[_m];
                    _ref6 = Object.keys(ad.trackingEvents);
                    for (_n = 0, _len6 = _ref6.length; _n < _len6; _n++) {
                      eventName = _ref6[_n];
                      (_base = creative.trackingEvents)[eventName] || (_base[eventName] = []);
                      creative.trackingEvents[eventName] = creative.trackingEvents[eventName].concat(ad.trackingEvents[eventName]);
                    }
                  }
                }
                response.ads.splice(index, 0, wrappedAd);
              }
            }
            delete ad.nextWrapperURL;
            return complete();
          });
        })(ad);
      }
      return complete();
    });
  };

  VASTParser.childByName = function(node, name) {
    var child, _i, _len, _ref;
    _ref = node.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.nodeName === name) return child;
    }
  };

  VASTParser.childsByName = function(node, name) {
    var child, childs, _i, _len, _ref;
    childs = [];
    _ref = node.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.nodeName === name) childs.push(child);
    }
    return childs;
  };

  VASTParser.parseAdElement = function(adElement) {
    var adTypeElement, _i, _len, _ref;
    _ref = adElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      adTypeElement = _ref[_i];
      if (adTypeElement.nodeName === "Wrapper") {
        return this.parseWrapperElement(adTypeElement);
      } else if (adTypeElement.nodeName === "InLine") {
        return this.parseInLineElement(adTypeElement);
      }
    }
  };

  VASTParser.parseWrapperElement = function(wrapperElement) {
    var ad, wrapperCreativeElement, wrapperURLElement;
    ad = this.parseInLineElement(wrapperElement);
    wrapperURLElement = this.childByName(wrapperElement, "VASTAdTagURI");
    if (wrapperURLElement != null) {
      ad.nextWrapperURL = wrapperURLElement.textContent;
    }
    wrapperCreativeElement = ad.creatives[0];
    if ((wrapperCreativeElement != null) && (wrapperCreativeElement.trackingEvents != null)) {
      ad.trackingEvents = wrapperCreativeElement.trackingEvents;
    }
    if (ad.nextWrapperURL != null) return ad;
  };

  VASTParser.parseInLineElement = function(inLineElement) {
    var ad, creative, creativeElement, creativeTypeElement, node, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3;
    ad = new VASTAd();
    _ref = inLineElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      switch (node.nodeName) {
        case "Error":
          ad.errorURLTemplates.push(node.textContent);
          break;
        case "Impression":
          ad.impressionURLTemplates.push(node.textContent);
          break;
        case "Creatives":
          _ref2 = this.childsByName(node, "Creative");
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            creativeElement = _ref2[_j];
            _ref3 = creativeElement.childNodes;
            for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
              creativeTypeElement = _ref3[_k];
              switch (creativeTypeElement.nodeName) {
                case "Linear":
                  creative = this.parseCreativeLinearElement(creativeTypeElement);
                  if (creative) ad.creatives.push(creative);
              }
            }
          }
      }
    }
    return ad;
  };

  VASTParser.parseCreativeLinearElement = function(creativeElement) {
    var creative, eventName, mediaFile, mediaFileElement, mediaFilesElement, percent, skipOffset, trackingElement, trackingEventsElement, trackingURLTemplate, videoClicksElement, _base, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    creative = new VASTCreativeLinear();
    creative.duration = this.parseDuration((_ref = this.childByName(creativeElement, "Duration")) != null ? _ref.textContent : void 0);
    if (creative.duration === -1 && creativeElement.parentNode.parentNode.parentNode.nodeName !== 'Wrapper') {
      return null;
    }
    skipOffset = creativeElement.getAttribute("skipoffset");
    if (!(skipOffset != null)) {
      creative.skipDelay = null;
    } else if (skipOffset.charAt(skipOffset.length - 1) === "%") {
      percent = parseInt(skipOffset, 10);
      creative.skipDelay = creative.duration * (percent / 100);
    } else {
      creative.skipDelay = this.parseDuration(skipOffset);
    }
    videoClicksElement = this.childByName(creativeElement, "VideoClicks");
    if (videoClicksElement != null) {
      creative.videoClickThroughURLTemplate = (_ref2 = this.childByName(videoClicksElement, "ClickThrough")) != null ? _ref2.textContent : void 0;
      creative.videoClickTrackingURLTemplate = (_ref3 = this.childByName(videoClicksElement, "ClickTracking")) != null ? _ref3.textContent : void 0;
    }
    _ref4 = this.childsByName(creativeElement, "TrackingEvents");
    for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
      trackingEventsElement = _ref4[_i];
      _ref5 = this.childsByName(trackingEventsElement, "Tracking");
      for (_j = 0, _len2 = _ref5.length; _j < _len2; _j++) {
        trackingElement = _ref5[_j];
        eventName = trackingElement.getAttribute("event");
        trackingURLTemplate = trackingElement.textContent;
        if ((eventName != null) && (trackingURLTemplate != null)) {
          if ((_base = creative.trackingEvents)[eventName] == null) {
            _base[eventName] = [];
          }
          creative.trackingEvents[eventName].push(trackingURLTemplate);
        }
      }
    }
    _ref6 = this.childsByName(creativeElement, "MediaFiles");
    for (_k = 0, _len3 = _ref6.length; _k < _len3; _k++) {
      mediaFilesElement = _ref6[_k];
      _ref7 = this.childsByName(mediaFilesElement, "MediaFile");
      for (_l = 0, _len4 = _ref7.length; _l < _len4; _l++) {
        mediaFileElement = _ref7[_l];
        mediaFile = new VASTMediaFile();
        mediaFile.fileURL = mediaFileElement.textContent;
        mediaFile.deliveryType = mediaFileElement.getAttribute("delivery");
        mediaFile.codec = mediaFileElement.getAttribute("codec");
        mediaFile.mimeType = mediaFileElement.getAttribute("type");
        mediaFile.bitrate = parseInt(mediaFileElement.getAttribute("bitrate") || 0);
        mediaFile.minBitrate = parseInt(mediaFileElement.getAttribute("minBitrate") || 0);
        mediaFile.maxBitrate = parseInt(mediaFileElement.getAttribute("maxBitrate") || 0);
        mediaFile.width = parseInt(mediaFileElement.getAttribute("width") || 0);
        mediaFile.height = parseInt(mediaFileElement.getAttribute("height") || 0);
        creative.mediaFiles.push(mediaFile);
      }
    }
    return creative;
  };

  VASTParser.parseDuration = function(durationString) {
    var durationComponents, hours, minutes, seconds, secondsAndMS;
    if (!(durationString != null)) return -1;
    durationComponents = durationString.split(":");
    if (durationComponents.length !== 3) return -1;
    secondsAndMS = durationComponents[2].split(".");
    seconds = parseInt(secondsAndMS[0]);
    if (secondsAndMS.length === 2) seconds += parseFloat("0." + secondsAndMS[1]);
    minutes = parseInt(durationComponents[1] * 60);
    hours = parseInt(durationComponents[0] * 60 * 60);
    if (isNaN(hours || isNaN(minutes || isNaN(seconds || minutes > 60 * 60 || seconds > 60)))) {
      return -1;
    }
    return hours + minutes + seconds;
  };

  return VASTParser;

})();

module.exports = VASTParser;

},{"./urlhandler.coffee":9,"./response.coffee":10,"./ad.coffee":11,"./util.coffee":5,"./creative.coffee":8,"./mediafile.coffee":12}],8:[function(require,module,exports){
var VASTCreative, VASTCreativeCompanion, VASTCreativeLinear, VASTCreativeNonLinear,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

VASTCreative = (function() {

  function VASTCreative() {
    this.trackingEvents = {};
  }

  return VASTCreative;

})();

VASTCreativeLinear = (function(_super) {

  __extends(VASTCreativeLinear, _super);

  function VASTCreativeLinear() {
    VASTCreativeLinear.__super__.constructor.apply(this, arguments);
    this.type = "linear";
    this.duration = 0;
    this.skipDelay = null;
    this.mediaFiles = [];
    this.videoClickThroughURLTemplate = null;
    this.videoClickTrackingURLTemplate = null;
  }

  return VASTCreativeLinear;

})(VASTCreative);

VASTCreativeNonLinear = (function(_super) {

  __extends(VASTCreativeNonLinear, _super);

  function VASTCreativeNonLinear() {
    VASTCreativeNonLinear.__super__.constructor.apply(this, arguments);
  }

  return VASTCreativeNonLinear;

})(VASTCreative);

VASTCreativeCompanion = (function(_super) {

  __extends(VASTCreativeCompanion, _super);

  function VASTCreativeCompanion() {
    VASTCreativeCompanion.__super__.constructor.apply(this, arguments);
  }

  return VASTCreativeCompanion;

})(VASTCreative);

module.exports = {
  VASTCreativeLinear: VASTCreativeLinear,
  VASTCreativeNonLinear: VASTCreativeNonLinear,
  VASTCreativeCompanion: VASTCreativeCompanion
};

},{}],11:[function(require,module,exports){
var VASTAd;

VASTAd = (function() {

  function VASTAd() {
    this.errorURLTemplates = [];
    this.impressionURLTemplates = [];
    this.creatives = [];
  }

  return VASTAd;

})();

module.exports = VASTAd;

},{}],10:[function(require,module,exports){
var VASTResponse;

VASTResponse = (function() {

  function VASTResponse() {
    this.ads = [];
    this.errorURLTemplates = [];
  }

  return VASTResponse;

})();

module.exports = VASTResponse;

},{}],12:[function(require,module,exports){
var VASTMediaFile;

VASTMediaFile = (function() {

  function VASTMediaFile() {
    this.fileURL = null;
    this.deliveryType = "progressive";
    this.mimeType = null;
    this.codec = null;
    this.bitrate = 0;
    this.minBitrate = 0;
    this.maxBitrate = 0;
    this.width = 0;
    this.height = 0;
  }

  return VASTMediaFile;

})();

module.exports = VASTMediaFile;

},{}],9:[function(require,module,exports){
var URLHandler, flash, xhr;

xhr = require('./urlhandlers/xmlhttprequest.coffee');

flash = require('./urlhandlers/flash.coffee');

URLHandler = (function() {

  function URLHandler() {}

  URLHandler.get = function(url, cb) {
    if (!(typeof window !== "undefined" && window !== null)) {
      return require('./urlhandlers/' + 'node.coffee').get(url, cb);
    } else if (xhr.supported()) {
      return xhr.get(url, cb);
    } else {
      return flash.get(url, cb);
    }
  };

  return URLHandler;

})();

module.exports = URLHandler;

},{"./urlhandlers/xmlhttprequest.coffee":13,"./urlhandlers/flash.coffee":14}],14:[function(require,module,exports){
var FlashURLHandler;

FlashURLHandler = (function() {

  function FlashURLHandler() {}

  FlashURLHandler.get = function(url, cb) {
    return cb('not supported');
  };

  return FlashURLHandler;

})();

module.exports = FlashURLHandler;

},{}],13:[function(require,module,exports){
var XHRURLHandler;

XHRURLHandler = (function() {

  function XHRURLHandler() {}

  XHRURLHandler.xhr = function() {
    var xhr;
    xhr = new window.XMLHttpRequest();
    if ('withCredentials' in xhr) return xhr;
  };

  XHRURLHandler.supported = function() {
    return !!this.xhr();
  };

  XHRURLHandler.get = function(url, cb) {
    var xhr;
    xhr = this.xhr();
    xhr.open('GET', url);
    xhr.send();
    return xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) return cb(null, xhr.responseXML);
    };
  };

  return XHRURLHandler;

})();

module.exports = XHRURLHandler;

},{}]},{},[1])(1)
});
;