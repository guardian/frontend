!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.DMVAST=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
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
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
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

},{}],3:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var VASTClient, VASTParser, VASTUtil;

VASTParser = _dereq_('./parser.coffee');

VASTUtil = _dereq_('./util.coffee');

VASTClient = (function() {
  function VASTClient() {}

  VASTClient.cappingFreeLunch = 0;

  VASTClient.cappingMinimumTimeInterval = 0;

  VASTClient.timeout = 0;

  VASTClient.get = function(url, cb) {
    var now;
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
    return VASTParser.parse(url, (function(_this) {
      return function(response) {
        return cb(response);
      };
    })(this));
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
    if (VASTClient.totalCalls == null) {
      VASTClient.totalCalls = 0;
    }
    if (VASTClient.totalCallsTimeout == null) {
      VASTClient.totalCallsTimeout = 0;
    }
  })();

  return VASTClient;

})();

module.exports = VASTClient;

},{"./parser.coffee":8,"./util.coffee":14}],4:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var VASTCompanionAd;

VASTCompanionAd = (function() {
  function VASTCompanionAd() {
    this.id = null;
    this.width = 0;
    this.height = 0;
    this.type = null;
    this.staticResource = null;
    this.companionClickThroughURLTemplate = null;
    this.trackingEvents = {};
  }

  return VASTCompanionAd;

})();

module.exports = VASTCompanionAd;

},{}],5:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var VASTCreative, VASTCreativeCompanion, VASTCreativeLinear, VASTCreativeNonLinear,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
    this.videoClickTrackingURLTemplates = [];
    this.adParameters = "";
  }

  return VASTCreativeLinear;

})(VASTCreative);

VASTCreativeNonLinear = (function(_super) {
  __extends(VASTCreativeNonLinear, _super);

  function VASTCreativeNonLinear() {
    return VASTCreativeNonLinear.__super__.constructor.apply(this, arguments);
  }

  return VASTCreativeNonLinear;

})(VASTCreative);

VASTCreativeCompanion = (function(_super) {
  __extends(VASTCreativeCompanion, _super);

  function VASTCreativeCompanion() {
    this.type = "companion";
    this.variations = [];
    this.videoClickTrackingURLTemplates = [];
  }

  return VASTCreativeCompanion;

})(VASTCreative);

module.exports = {
  VASTCreativeLinear: VASTCreativeLinear,
  VASTCreativeNonLinear: VASTCreativeNonLinear,
  VASTCreativeCompanion: VASTCreativeCompanion
};

},{}],6:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
module.exports = {
  client: _dereq_('./client.coffee'),
  tracker: _dereq_('./tracker.coffee'),
  parser: _dereq_('./parser.coffee'),
  util: _dereq_('./util.coffee')
};

},{"./client.coffee":3,"./parser.coffee":8,"./tracker.coffee":10,"./util.coffee":14}],7:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
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
    this.apiFramework = null;
  }

  return VASTMediaFile;

})();

module.exports = VASTMediaFile;

},{}],8:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var EventEmitter, URLHandler, VASTAd, VASTCompanionAd, VASTCreativeCompanion, VASTCreativeLinear, VASTMediaFile, VASTParser, VASTResponse, VASTUtil,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

URLHandler = _dereq_('./urlhandler.coffee');

VASTResponse = _dereq_('./response.coffee');

VASTAd = _dereq_('./ad.coffee');

VASTUtil = _dereq_('./util.coffee');

VASTCreativeLinear = _dereq_('./creative.coffee').VASTCreativeLinear;

VASTCreativeCompanion = _dereq_('./creative.coffee').VASTCreativeCompanion;

VASTMediaFile = _dereq_('./mediafile.coffee');

VASTCompanionAd = _dereq_('./companionad.coffee');

EventEmitter = _dereq_('events').EventEmitter;

VASTParser = (function() {
  var URLTemplateFilters;

  function VASTParser() {}

  URLTemplateFilters = [];

  VASTParser.addURLTemplateFilter = function(func) {
    if (typeof func === 'function') {
      URLTemplateFilters.push(func);
    }
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

  VASTParser.vent = new EventEmitter();

  VASTParser.track = function(templates, errorCode) {
    this.vent.emit('VAST-error', errorCode);
    return VASTUtil.track(templates, errorCode);
  };

  VASTParser.on = function(eventName, cb) {
    return this.vent.on(eventName, cb);
  };

  VASTParser.once = function(eventName, cb) {
    return this.vent.once(eventName, cb);
  };

  VASTParser._parse = function(url, parentURLs, cb) {
    var filter, _i, _len;
    for (_i = 0, _len = URLTemplateFilters.length; _i < _len; _i++) {
      filter = URLTemplateFilters[_i];
      url = filter(url);
    }
    if (parentURLs == null) {
      parentURLs = [];
    }
    parentURLs.push(url);
    return URLHandler.get(url, (function(_this) {
      return function(err, xml) {
        var ad, complete, loopIndex, node, response, _j, _k, _len1, _len2, _ref, _ref1;
        if (err != null) {
          return cb(err);
        }
        response = new VASTResponse();
        if (!(((xml != null ? xml.documentElement : void 0) != null) && xml.documentElement.nodeName === "VAST")) {
          return cb();
        }
        _ref = xml.documentElement.childNodes;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          node = _ref[_j];
          if (node.nodeName === 'Error') {
            response.errorURLTemplates.push(_this.parseNodeText(node));
          }
        }
        _ref1 = xml.documentElement.childNodes;
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          node = _ref1[_k];
          if (node.nodeName === 'Ad') {
            ad = _this.parseAdElement(node);
            if (ad != null) {
              response.ads.push(ad);
            } else {
              _this.track(response.errorURLTemplates, {
                ERRORCODE: 101
              });
            }
          }
        }
        complete = function(errorAlreadyRaised) {
          var _l, _len3, _ref2;
          if (errorAlreadyRaised == null) {
            errorAlreadyRaised = false;
          }
          if (!response) {
            return;
          }
          _ref2 = response.ads;
          for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
            ad = _ref2[_l];
            if (ad.nextWrapperURL != null) {
              return;
            }
          }
          if (response.ads.length === 0) {
            if (!errorAlreadyRaised) {
              _this.track(response.errorURLTemplates, {
                ERRORCODE: 303
              });
            }
            response = null;
          }
          return cb(null, response);
        };
        loopIndex = response.ads.length;
        while (loopIndex--) {
          ad = response.ads[loopIndex];
          if (ad.nextWrapperURL == null) {
            continue;
          }
          (function(ad) {
            var baseURL, _ref2;
            if (parentURLs.length >= 10 || (_ref2 = ad.nextWrapperURL, __indexOf.call(parentURLs, _ref2) >= 0)) {
              _this.track(ad.errorURLTemplates, {
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
              var creative, errorAlreadyRaised, eventName, index, wrappedAd, _base, _l, _len3, _len4, _len5, _len6, _m, _n, _o, _ref3, _ref4, _ref5, _ref6;
              errorAlreadyRaised = false;
              if (err != null) {
                _this.track(ad.errorURLTemplates, {
                  ERRORCODE: 301
                });
                response.ads.splice(response.ads.indexOf(ad), 1);
                errorAlreadyRaised = true;
              } else if (wrappedResponse == null) {
                _this.track(ad.errorURLTemplates, {
                  ERRORCODE: 303
                });
                response.ads.splice(response.ads.indexOf(ad), 1);
                errorAlreadyRaised = true;
              } else {
                response.errorURLTemplates = response.errorURLTemplates.concat(wrappedResponse.errorURLTemplates);
                index = response.ads.indexOf(ad);
                response.ads.splice(index, 1);
                _ref3 = wrappedResponse.ads;
                for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
                  wrappedAd = _ref3[_l];
                  wrappedAd.errorURLTemplates = ad.errorURLTemplates.concat(wrappedAd.errorURLTemplates);
                  wrappedAd.impressionURLTemplates = ad.impressionURLTemplates.concat(wrappedAd.impressionURLTemplates);
                  if (ad.trackingEvents != null) {
                    _ref4 = wrappedAd.creatives;
                    for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
                      creative = _ref4[_m];
                      if (creative.type === 'linear') {
                        _ref5 = Object.keys(ad.trackingEvents);
                        for (_n = 0, _len5 = _ref5.length; _n < _len5; _n++) {
                          eventName = _ref5[_n];
                          (_base = creative.trackingEvents)[eventName] || (_base[eventName] = []);
                          creative.trackingEvents[eventName] = creative.trackingEvents[eventName].concat(ad.trackingEvents[eventName]);
                        }
                      }
                    }
                  }
                  if (ad.videoClickTrackingURLTemplates != null) {
                    _ref6 = wrappedAd.creatives;
                    for (_o = 0, _len6 = _ref6.length; _o < _len6; _o++) {
                      creative = _ref6[_o];
                      if (creative.type === 'linear') {
                        creative.videoClickTrackingURLTemplates = creative.videoClickTrackingURLTemplates.concat(ad.videoClickTrackingURLTemplates);
                      }
                    }
                  }
                  response.ads.splice(index, 0, wrappedAd);
                }
              }
              delete ad.nextWrapperURL;
              return complete(errorAlreadyRaised);
            });
          })(ad);
        }
        return complete();
      };
    })(this));
  };

  VASTParser.childByName = function(node, name) {
    var child, _i, _len, _ref;
    _ref = node.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.nodeName === name) {
        return child;
      }
    }
  };

  VASTParser.childsByName = function(node, name) {
    var child, childs, _i, _len, _ref;
    childs = [];
    _ref = node.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      if (child.nodeName === name) {
        childs.push(child);
      }
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
    var ad, creative, wrapperCreativeElement, wrapperURLElement, _i, _len, _ref;
    ad = this.parseInLineElement(wrapperElement);
    wrapperURLElement = this.childByName(wrapperElement, "VASTAdTagURI");
    if (wrapperURLElement != null) {
      ad.nextWrapperURL = this.parseNodeText(wrapperURLElement);
    }
    wrapperCreativeElement = null;
    _ref = ad.creatives;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      creative = _ref[_i];
      if (creative.type === 'linear') {
        wrapperCreativeElement = creative;
        break;
      }
    }
    if (wrapperCreativeElement != null) {
      if (wrapperCreativeElement.trackingEvents != null) {
        ad.trackingEvents = wrapperCreativeElement.trackingEvents;
      }
      if (wrapperCreativeElement.videoClickTrackingURLTemplates != null) {
        ad.videoClickTrackingURLTemplates = wrapperCreativeElement.videoClickTrackingURLTemplates;
      }
    }
    if (ad.nextWrapperURL != null) {
      return ad;
    }
  };

  VASTParser.parseInLineElement = function(inLineElement) {
    var ad, creative, creativeElement, creativeTypeElement, node, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    ad = new VASTAd();
    _ref = inLineElement.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      switch (node.nodeName) {
        case "Error":
          ad.errorURLTemplates.push(this.parseNodeText(node));
          break;
        case "Impression":
          ad.impressionURLTemplates.push(this.parseNodeText(node));
          break;
        case "Creatives":
          _ref1 = this.childsByName(node, "Creative");
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            creativeElement = _ref1[_j];
            _ref2 = creativeElement.childNodes;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              creativeTypeElement = _ref2[_k];
              switch (creativeTypeElement.nodeName) {
                case "Linear":
                  creative = this.parseCreativeLinearElement(creativeTypeElement);
                  if (creative) {
                    ad.creatives.push(creative);
                  }
                  break;
                case "CompanionAds":
                  creative = this.parseCompanionAd(creativeTypeElement);
                  if (creative) {
                    ad.creatives.push(creative);
                  }
              }
            }
          }
      }
    }
    return ad;
  };

  VASTParser.parseCreativeLinearElement = function(creativeElement) {
    var clickTrackingElement, creative, eventName, mediaFile, mediaFileElement, mediaFilesElement, percent, skipOffset, trackingElement, trackingEventsElement, trackingURLTemplate, videoClicksElement, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4;
    creative = new VASTCreativeLinear();
    creative.duration = this.parseDuration(this.parseNodeText(this.childByName(creativeElement, "Duration")));
    if (creative.duration === -1 && creativeElement.parentNode.parentNode.parentNode.nodeName !== 'Wrapper') {
      return null;
    }
    creative.adParameters = this.parseNodeText(this.childByName(creativeElement, "AdParameters"));
    skipOffset = creativeElement.getAttribute("skipoffset");
    if (skipOffset == null) {
      creative.skipDelay = null;
    } else if (skipOffset.charAt(skipOffset.length - 1) === "%") {
      percent = parseInt(skipOffset, 10);
      creative.skipDelay = creative.duration * (percent / 100);
    } else {
      creative.skipDelay = this.parseDuration(skipOffset);
    }
    videoClicksElement = this.childByName(creativeElement, "VideoClicks");
    if (videoClicksElement != null) {
      creative.videoClickThroughURLTemplate = this.parseNodeText(this.childByName(videoClicksElement, "ClickThrough"));
      _ref = this.childsByName(videoClicksElement, "ClickTracking");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        clickTrackingElement = _ref[_i];
        creative.videoClickTrackingURLTemplates.push(this.parseNodeText(clickTrackingElement));
      }
    }
    _ref1 = this.childsByName(creativeElement, "TrackingEvents");
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      trackingEventsElement = _ref1[_j];
      _ref2 = this.childsByName(trackingEventsElement, "Tracking");
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        trackingElement = _ref2[_k];
        eventName = trackingElement.getAttribute("event");
        trackingURLTemplate = this.parseNodeText(trackingElement);
        if ((eventName != null) && (trackingURLTemplate != null)) {
          if ((_base = creative.trackingEvents)[eventName] == null) {
            _base[eventName] = [];
          }
          creative.trackingEvents[eventName].push(trackingURLTemplate);
        }
      }
    }
    _ref3 = this.childsByName(creativeElement, "MediaFiles");
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      mediaFilesElement = _ref3[_l];
      _ref4 = this.childsByName(mediaFilesElement, "MediaFile");
      for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
        mediaFileElement = _ref4[_m];
        mediaFile = new VASTMediaFile();
        mediaFile.fileURL = this.parseNodeText(mediaFileElement);
        mediaFile.deliveryType = mediaFileElement.getAttribute("delivery");
        mediaFile.codec = mediaFileElement.getAttribute("codec");
        mediaFile.mimeType = mediaFileElement.getAttribute("type");
        mediaFile.apiFramework = mediaFileElement.getAttribute("apiFramework");
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

  VASTParser.parseCompanionAd = function(creativeElement) {
    var companionAd, companionResource, creative, eventName, staticElement, trackingElement, trackingEventsElement, trackingURLTemplate, _base, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    creative = new VASTCreativeCompanion();
    _ref = this.childsByName(creativeElement, "Companion");
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      companionResource = _ref[_i];
      companionAd = new VASTCompanionAd();
      companionAd.id = companionResource.getAttribute("id") || null;
      companionAd.width = companionResource.getAttribute("width");
      companionAd.height = companionResource.getAttribute("height");
      _ref1 = this.childsByName(companionResource, "StaticResource");
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        staticElement = _ref1[_j];
        companionAd.type = staticElement.getAttribute("creativeType") || 0;
        companionAd.staticResource = this.parseNodeText(staticElement);
      }
      _ref2 = this.childsByName(companionResource, "TrackingEvents");
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        trackingEventsElement = _ref2[_k];
        _ref3 = this.childsByName(trackingEventsElement, "Tracking");
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          trackingElement = _ref3[_l];
          eventName = trackingElement.getAttribute("event");
          trackingURLTemplate = this.parseNodeText(trackingElement);
          if ((eventName != null) && (trackingURLTemplate != null)) {
            if ((_base = companionAd.trackingEvents)[eventName] == null) {
              _base[eventName] = [];
            }
            companionAd.trackingEvents[eventName].push(trackingURLTemplate);
          }
        }
      }
      companionAd.companionClickThroughURLTemplate = this.parseNodeText(this.childByName(companionResource, "CompanionClickThrough"));
      creative.variations.push(companionAd);
    }
    return creative;
  };

  VASTParser.parseDuration = function(durationString) {
    var durationComponents, hours, minutes, seconds, secondsAndMS;
    if (!(durationString != null)) {
      return -1;
    }
    durationComponents = durationString.split(":");
    if (durationComponents.length !== 3) {
      return -1;
    }
    secondsAndMS = durationComponents[2].split(".");
    seconds = parseInt(secondsAndMS[0]);
    if (secondsAndMS.length === 2) {
      seconds += parseFloat("0." + secondsAndMS[1]);
    }
    minutes = parseInt(durationComponents[1] * 60);
    hours = parseInt(durationComponents[0] * 60 * 60);
    if (isNaN(hours || isNaN(minutes || isNaN(seconds || minutes > 60 * 60 || seconds > 60)))) {
      return -1;
    }
    return hours + minutes + seconds;
  };

  VASTParser.parseNodeText = function(node) {
    return node && (node.textContent || node.text);
  };

  return VASTParser;

})();

module.exports = VASTParser;

},{"./ad.coffee":2,"./companionad.coffee":4,"./creative.coffee":5,"./mediafile.coffee":7,"./response.coffee":9,"./urlhandler.coffee":11,"./util.coffee":14,"events":1}],9:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var VASTResponse;

VASTResponse = (function() {
  function VASTResponse() {
    this.ads = [];
    this.errorURLTemplates = [];
  }

  return VASTResponse;

})();

module.exports = VASTResponse;

},{}],10:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var EventEmitter, VASTClient, VASTCreativeLinear, VASTTracker, VASTUtil,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

VASTClient = _dereq_('./client.coffee');

VASTUtil = _dereq_('./util.coffee');

VASTCreativeLinear = _dereq_('./creative.coffee').VASTCreativeLinear;

EventEmitter = _dereq_('events').EventEmitter;

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
    this.emitAlwaysEvents = ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'resume', 'pause', 'rewind', 'skip', 'closeLinear', 'close'];
    _ref = creative.trackingEvents;
    for (eventName in _ref) {
      events = _ref[eventName];
      this.trackingEvents[eventName] = events.slice(0);
    }
    if (creative instanceof VASTCreativeLinear) {
      this.setDuration(creative.duration);
      this.skipDelay = creative.skipDelay;
      this.linear = true;
      this.clickThroughURLTemplate = creative.videoClickThroughURLTemplate;
      this.clickTrackingURLTemplates = creative.videoClickTrackingURLTemplates;
    } else {
      this.skipDelay = -1;
      this.linear = false;
    }
    this.on('start', function() {
      VASTClient.lastSuccessfullAd = +new Date();
    });
  }

  VASTTracker.prototype.setDuration = function(duration) {
    this.assetDuration = duration;
    return this.quartiles = {
      'firstQuartile': Math.round(25 * this.assetDuration) / 100,
      'midpoint': Math.round(50 * this.assetDuration) / 100,
      'thirdQuartile': Math.round(75 * this.assetDuration) / 100
    };
  };

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
          if ((time <= progress && progress <= (time + 1))) {
            events.push(quartile);
          }
        }
      }
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        eventName = events[_i];
        this.track(eventName, true);
      }
      if (progress < this.progress) {
        this.track("rewind");
      }
    }
    return this.progress = progress;
  };

  VASTTracker.prototype.setMuted = function(muted) {
    if (this.muted !== muted) {
      this.track(muted ? "muted" : "unmuted");
    }
    return this.muted = muted;
  };

  VASTTracker.prototype.setPaused = function(paused) {
    if (this.paused !== paused) {
      this.track(paused ? "pause" : "resume");
    }
    return this.paused = paused;
  };

  VASTTracker.prototype.setFullscreen = function(fullscreen) {
    if (this.fullscreen !== fullscreen) {
      this.track(fullscreen ? "fullscreen" : "exitFullscreen");
    }
    return this.fullscreen = fullscreen;
  };

  VASTTracker.prototype.setSkipDelay = function(duration) {
    if (typeof duration === 'number') {
      return this.skipDelay = duration;
    }
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
    var clickThroughURL, variables, _ref;
    if ((_ref = this.clickTrackingURLTemplates) != null ? _ref.length : void 0) {
      this.trackURLs(this.clickTrackingURLTemplates);
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
    if (once == null) {
      once = false;
    }
    if (eventName === 'closeLinear' && ((this.trackingEvents[eventName] == null) && (this.trackingEvents['close'] != null))) {
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
      if (idx > -1) {
        this.emitAlwaysEvents.splice(idx, 1);
      }
    }
  };

  VASTTracker.prototype.trackURLs = function(URLTemplates, variables) {
    if (variables == null) {
      variables = {};
    }
    if (this.linear) {
      variables["CONTENTPLAYHEAD"] = this.progressFormated();
    }
    return VASTUtil.track(URLTemplates, variables);
  };

  VASTTracker.prototype.progressFormated = function() {
    var h, m, ms, s, seconds;
    seconds = parseInt(this.progress);
    h = seconds / (60 * 60);
    if (h.length < 2) {
      h = "0" + h;
    }
    m = seconds / 60 % 60;
    if (m.length < 2) {
      m = "0" + m;
    }
    s = seconds % 60;
    if (s.length < 2) {
      s = "0" + m;
    }
    ms = parseInt((this.progress - seconds) * 100);
    return "" + h + ":" + m + ":" + s + "." + ms;
  };

  return VASTTracker;

})(EventEmitter);

module.exports = VASTTracker;

},{"./client.coffee":3,"./creative.coffee":5,"./util.coffee":14,"events":1}],11:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var URLHandler, flash, xhr;

xhr = _dereq_('./urlhandlers/xmlhttprequest.coffee');

flash = _dereq_('./urlhandlers/flash.coffee');

URLHandler = (function() {
  function URLHandler() {}

  URLHandler.get = function(url, cb) {
    if (typeof window === "undefined" || window === null) {
      return _dereq_('./urlhandlers/' + 'node.coffee').get(url, cb);
    } else if (xhr.supported()) {
      return xhr.get(url, cb);
    } else if (flash.supported()) {
      return flash.get(url, cb);
    } else {
      return cb();
    }
  };

  return URLHandler;

})();

module.exports = URLHandler;

},{"./urlhandlers/flash.coffee":12,"./urlhandlers/xmlhttprequest.coffee":13}],12:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var FlashURLHandler;

FlashURLHandler = (function() {
  function FlashURLHandler() {}

  FlashURLHandler.xdr = function() {
    var xdr;
    if (window.XDomainRequest) {
      xdr = new XDomainRequest();
    }
    return xdr;
  };

  FlashURLHandler.supported = function() {
    return !!this.xdr();
  };

  FlashURLHandler.get = function(url, cb) {
    var xdr, xmlDocument;
    if (xmlDocument = typeof window.ActiveXObject === "function" ? new window.ActiveXObject("Microsoft.XMLDOM") : void 0) {
      xmlDocument.async = false;
    } else {
      return cb();
    }
    xdr = this.xdr();
    xdr.open('GET', url);
    xdr.send();
    return xdr.onload = function() {
      xmlDocument.loadXML(xdr.responseText);
      return cb(null, xmlDocument);
    };
  };

  return FlashURLHandler;

})();

module.exports = FlashURLHandler;

},{}],13:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
var XHRURLHandler;

XHRURLHandler = (function() {
  function XHRURLHandler() {}

  XHRURLHandler.xhr = function() {
    var xhr;
    xhr = new window.XMLHttpRequest();
    if ('withCredentials' in xhr) {
      return xhr;
    }
  };

  XHRURLHandler.supported = function() {
    return !!this.xhr();
  };

  XHRURLHandler.get = function(url, cb) {
    var xhr;
    try {
      xhr = this.xhr();
      xhr.open('GET', url);
      xhr.send();
      return xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          return cb(null, xhr.responseXML);
        }
      };
    } catch (_error) {
      return cb();
    }
  };

  return XHRURLHandler;

})();

module.exports = XHRURLHandler;

},{}],14:[function(_dereq_,module,exports){
// Generated by CoffeeScript 1.7.1
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
    var URLTemplate, URLs, key, macro1, macro2, resolveURL, value, _i, _len;
    URLs = [];
    if (variables == null) {
      variables = {};
    }
    if (!("CACHEBUSTING" in variables)) {
      variables["CACHEBUSTING"] = Math.round(Math.random() * 1.0e+10);
    }
    variables["random"] = variables["CACHEBUSTING"];
    for (_i = 0, _len = URLTemplates.length; _i < _len; _i++) {
      URLTemplate = URLTemplates[_i];
      resolveURL = URLTemplate;
      if (!resolveURL) {
        continue;
      }
      for (key in variables) {
        value = variables[key];
        macro1 = "[" + key + "]";
        macro2 = "%%" + key + "%%";
        resolveURL = resolveURL.replace(macro1, value);
        resolveURL = resolveURL.replace(macro2, value);
      }
      URLs.push(resolveURL);
    }
    return URLs;
  };

  VASTUtil.storage = (function() {
    var data, isDisabled, storage, storageError;
    try {
      storage = typeof window !== "undefined" && window !== null ? window.localStorage || window.sessionStorage : null;
    } catch (_error) {
      storageError = _error;
      storage = null;
    }
    isDisabled = function(store) {
      var e, testValue;
      try {
        testValue = '__VASTUtil__';
        store.setItem(testValue, testValue);
        if (store.getItem(testValue) !== testValue) {
          return true;
        }
      } catch (_error) {
        e = _error;
        return true;
      }
      return false;
    };
    if ((storage == null) || isDisabled(storage)) {
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

},{}]},{},[6])
(6)
});