define(['common'], function (common) {

    function Router() {
    
        var _routes = [];
        var that = this;

        this.parseRoute = function(path) {
            this.parseGroups = function(loc) {
                var nameRegexp = new RegExp(":([^/.\\\\]+)", "g");
                var newRegexp = "" + loc;
                var groups = {};
                var matches = null;
                var i = 0;

                // Find the places to edit.
                while(matches = nameRegexp.exec(loc)) {
                    groups[matches[1]] = i++;
                    newRegexp = newRegexp.replace(matches[0], "([^/.\\\\]+)");
                }

                newRegexp += "$"; // Only do a full string match

                return { "groups" : groups, "regexp": new RegExp(newRegexp)};
            };

            return this.parseGroups(path);
        };

        var matchRoute = function(url, e) {
            var route = null;
            for(var i = 0; route = _routes[i]; i ++) {
                var routeMatch = route.regex.regexp.exec(url);
                if(!!routeMatch == false) continue;

            var params = {};
            for(var g in route.regex.groups) {
            var group = route.regex.groups[g];
            params[g] = routeMatch[group + 1];
            }

            var values = {};
            if(e && e.target instanceof HTMLFormElement) {
            var form = e.target;
            var items = form.length;
            var item;
            for(var j = 0; item = form[j]; j++) {
            if(!!item.name) values[item.name] = item.value;
            }
            }

            route.callback({"url": url, "params": params, "values" : values, "e": e});
            return true;
            }

            return false;
        };

  this.get = function(route, callback) {
    _routes.push({regex: this.parseRoute(route), "callback": callback, method: "get"});
  };

  this.post = function(route, callback) {
    _routes.push({regex: this.parseRoute(route), "callback": callback, method: "post"});
  };

  this.test = function(url) {
    matchRoute(url);
  };

  this.getRoutes = function() {
    return _routes;
  };

  var attach = function() {
    var triggered = false;
    var cancelHashChange = false;
    var cancelPopstate = false;

    // Add a new event to HTML5 History
    if(!!window.history && !!window.history.pushState) {
      
      var pushStateProxy = history.__proto__.pushState;

      history.__proto__.pushState = function(state, title, url) {
        pushStateProxy.apply(history, arguments);

        //var evt = document.createEvent("PopStateEvent");
        //evt.initPopStateEvent("statechange", false, false, state);
        var evt = document.createEvent("Event");
        evt.initEvent("statechanged",false, false);
        evt.state = state;
        window.dispatchEvent(evt);
        return;
      };
    }

    me.run = function() {
      if(!triggered) {
        matchRoute(document.location.pathname);
        triggered = true;
      }
    };

    // Intercept FORM submissions.
    window.addEventListener("submit", function(e) {
      if(e.target.method == "post") {
        if (matchRoute(e.target.action, e)) {
           e.preventDefault();
           return false;
        }
      }
      // If we haven't matched a URL let the normal request happen. 
      return true;
    });

    window.addEventListener("popstate", function(e) {
      if(cancelPopstate) {
        cancelPopstate = false;
        cancelHashChange = false;
        return;
      }

      matchRoute(document.location.pathname);
      // popstate fires before a hash change, don't fire twice.
      cancelHashChange = true;
    }, false);

    window.addEventListener("load", function(e) {
      if(!triggered) {
        matchRoute(document.location.pathname);
        triggered = true;
      }

      cancelHashChange = true;
      cancelPopstate = true;
    }, false);

    window.addEventListener("hashchange", function(e) {
      if(cancelHashChange) {
        cancelHashChange = false;
        cancelPopstate = false;
        return;
      }
      matchRoute(document.location.pathname);
    }, false);
  };

  attach();


    }
    
    return Router;

});
