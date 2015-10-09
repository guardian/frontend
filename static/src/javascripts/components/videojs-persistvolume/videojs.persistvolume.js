
 (function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define('videojs-persistvolume', ["videojs"], function (a0) {
      return (factory(window, document, a0));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(window, document, require("video.js"));
  } else {
    root['videojs-persistvolume'] = factory(window, document, videojs);
  }
}(this, function(window, document, vjs) {
  //cookie functions from https://developer.mozilla.org/en-US/docs/DOM/document.cookie
  var
  getCookieItem = function(sKey) {
    if (!sKey || !hasCookieItem(sKey)) { return null; }
    var reg_ex = new RegExp(
      "(?:^|.*;\\s*)" +
      window.escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") +
      "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"
    );
    return window.unescape(document.cookie.replace(reg_ex,"$1"));
  },

  setCookieItem = function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return; }
    var sExpires = "";
    if (vEnd) {
      switch (vEnd.constructor) {
        case Number:
          sExpires = vEnd === Infinity ? "; expires=Tue, 19 Jan 2038 03:14:07 GMT" : "; max-age=" + vEnd;
          break;
        case String:
          sExpires = "; expires=" + vEnd;
          break;
        case Date:
          sExpires = "; expires=" + vEnd.toGMTString();
          break;
      }
    }
    document.cookie =
      window.escape(sKey) + "=" +
      window.escape(sValue) +
      sExpires +
      (sDomain ? "; domain=" + sDomain : "") +
      (sPath ? "; path=" + sPath : "") +
      (bSecure ? "; secure" : "");
  },

  hasCookieItem = function(sKey) {
    return (new RegExp(
      "(?:^|;\\s*)" +
      window.escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") +
      "\\s*\\=")
    ).test(document.cookie);
  },

  hasLocalStorage = function() {
    try {
      window.localStorage.setItem('persistVolume', 'persistVolume');
      window.localStorage.removeItem('persistVolume');
      return true;
    } catch(e) {
      return false;
    }
  },
  getStorageItem = function(key) {
    return hasLocalStorage() ? window.localStorage.getItem(key) : getCookieItem(key);
  },
  setStorageItem = function(key, value) {
    return hasLocalStorage() ? window.localStorage.setItem(key, value) : setCookieItem(key, value, Infinity, '/');
  },

  extend = function(obj) {
    var arg, i, k;
    for (i = 1; i < arguments.length; i++) {
      arg = arguments[i];
      for (k in arg) {
        if (arg.hasOwnProperty(k)) {
          obj[k] = arg[k];
        }
      }
    }
    return obj;
  },

  defaults = {
    namespace: ""
  },

  volumePersister = function(options) {
    var player = this;
    var settings = extend({}, defaults, options || {});

    var key = settings.namespace + '-' + 'volume';
    var muteKey = settings.namespace + '-' + 'mute';

    player.on("volumechange", function() {
      setStorageItem(key, player.volume());
      setStorageItem(muteKey, player.muted());
    });

    var persistedVolume = getStorageItem(key);
    if(persistedVolume !== null){
      player.volume(persistedVolume);
    }

    var persistedMute = getStorageItem(muteKey);
    if(persistedMute !== null){
      player.muted('true' === persistedMute);
    }
  };

  vjs.plugin("persistvolume", volumePersister);

}));