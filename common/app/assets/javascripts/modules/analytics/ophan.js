define(function() {

  var doc     = window.document,
      storage = window.localStorage,
      perf    = window.performance || window.msPerformance || window.webkitPerformance || window.mozPerformance,
      body    = doc.body,
      isModernBrowser = (storage && body.addEventListener && JSON !== undefined);

  var additionalDataGenerators = [];

  // Initialise and send
  function startLog() {
    initEventListeners();
    sendLog();
  }

  // Just initialise
  function initLog() {
    initEventListeners();
  }

  // Just send
  function sendLog(referrer) {
    var pageinfo = {
      v: 8,
      url: location.href,
      ref: referrer || doc.referrer,
      gu_mi: getCookie('GU_MI'),
      s_vi: getCookie('s_vi')
    };

    for (var i = 0; i < additionalDataGenerators.length; i++) {
      var data = additionalDataGenerators[i]();
      for (var name in data) {
        if (data.hasOwnProperty(name) && data[name] !== null && data[name] !== undefined && data[name] !== '') {
          pageinfo[name] = data[name];
        }
      }
    }

    // Start building up tracking URL.
    var url = toQueryString(pageinfo);

    // Add performance data if browser has it.
    if (perf) {
      url += 'perf=' + getPerformanceData() + '&';
    }

    // Add last page data if browser has it in localstorage. We lose IE 8 here.
    if (isModernBrowser) {
      // Add data from localStorage if it's there.
      url += getLocalStorageItems(['ophan_follow']);
    }

    // Make the call to tracker.
    createImage('http://ophan.guardian.co.uk/t.gif?' + url);
  }

  function validAncestor (el) {
    var name = el.nodeName.toLowerCase();
    return name === 'a' ? el : name !== 'body' ? validAncestor(el.parentNode) : false;
  }

  function initEventListeners() {
    if (isModernBrowser) {
      // Set up event listener to capture next click.
      body.addEventListener('click', function(e) {
        var target = validAncestor(e.target);
        if (target) {
          var info = {
            from: [location.protocol, '//', location.host, location.pathname].join(''),
            to: target.href,
            sel: getPath(target),
            hash: makeHash(target.innerHTML)
          };
          //Set in localStorage
          additionalClickData(info) ;
        }
      }, false);
    }
  }

  function createImage(url) {
    var image = new Image();
    image.src = url.substring(0, url.length-1); // Chop the extra &.
    image.style.display = 'none';
    body.appendChild(image);
  }

  function makeHash(s) {
    /*jshint bitwise:false */
    var hash = 0;
    for (var i = 0, j = s.length - 1; 0 <= j ? i <= j : i >= j; 0 <= j ? i++ : i--) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash = hash & hash;
    }
    return hash;
  }

  function getPerformanceData() {
    if (perf) {
      var t = perf.timing;
      return [
        // Time required for domain lookup.
        t.domainLookupEnd - t.domainLookupStart,
        // Time to establish a connection to server.
        t.connectEnd - t.connectStart,
        // From connection established to first byte of data.
        t.responseStart - t.connectEnd,
        // First byte to last byte, or closed, including if from cache.
        t.responseEnd - t.responseStart,
        // From last byte of doc to start of domContentLoaded
        t.domContentLoadedEventStart - t.responseEnd,
        // domcontentLoaded to start of load event.
        t.loadEventStart - t.domContentLoadedEventStart,
        // click, back/forward, etc...
        perf.navigation.type,
        // No. of redirects on current domain.
        perf.navigation.redirectCount
      ].join(',');
    }
  }

  function getCookie(name) {
    var name_eq = name + '=';
    var ca = doc.cookie.split(';');
    for (var i = 0, j = ca.length; i < j; ++i) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(name_eq) ===  0) {
        return c.substring(name_eq.length, c.length);
      }
    }
    return null;
  }

  function getPath(elem, path) {
    /*jshint boss:true */

    path = path || '';

    // If we've reached html element, we're done.
    if (elem.nodeName.toLowerCase() === 'html') {
      return 'html' + path;
    }

    // If we've got an id, we can stop (in theory!)
    var id = elem.id;
    if (id) {
      return '#' + id + path;
    }

    // Get the element name
    var name = elem.nodeName.toLowerCase();

    // And add any class attr values.
    var cls = elem.className;
    if (cls) {
      name += '.' + cls.trim().split(/[\s\n]+/).join('.');
    }

    // Figure out if there are dupe siblings and add a nth-child if so.
    if (hasDupeElementSiblings(elem)) {
      for (var c = 1, e = elem; e = e.previousSibling;) {
        if (e.nodeType === 1) {
          c++;
        }
      }
      name += ':nth-child(' + c + ')';
    }

    // Recurse up the DOM till we're done.
    return getPath(elem.parentNode, '>' + name + path);
  }

  function hasDupeElementSiblings(elem) {
    for (var count = 1, sib = elem.parentNode.firstChild; sib; sib = sib.nextSibling) {
      if (sib.nodeName === elem.nodeName) { // Is it the same element type.
        if (count > 1) {
          return true;
        }
        count++;
      }
    }
    return false;
  }

  function toQueryString(obj) {
    var url = '';
    for (var name in obj) {
      if (obj.hasOwnProperty(name) && obj[name] !== null && obj[name] !== undefined && obj[name] !== '') {
        url += encodeURIComponent(name) + '=' + encodeURIComponent(obj[name]) + '&';
      }
    }
    return url;
  }

  function getLocalStorageItems(items) {
    var url = '';
    for(var i = 0, l=items.length; i < l; i++) {
      var item = storage.getItem(items[i]);
      if (item !== null) {
        storage.removeItem(items[i]);
        url += toQueryString(JSON.parse(item));
      }
    }
    return  url;
  }

  function additionalViewData(dataGenerator) {
    additionalDataGenerators[additionalDataGenerators.length] = dataGenerator;
  }

  function additionalClickData(data) {
    if(isModernBrowser) {
      var oldData = JSON.parse(storage.getItem('ophan_follow')),
          newData = data;

      if(oldData !== null) {
        for (var key in oldData) {
            newData[key] = oldData[key];
        }
      }

      storage.setItem('ophan_follow', JSON.stringify(newData));
    }
  }

  return {
    'additionalClickData' : additionalClickData,
    'additionalViewData': additionalViewData,
    'startLog': startLog,
    'initLog': initLog,
    'sendLog': sendLog
  };

});
