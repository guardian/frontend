//Client-side routing module
//Heavily inspired by https://github.com/PaulKinlan/leviroutes/blob/master/routes.js
/*jshint boss:true, curly:false */
define([
    'common'
], function (
    common
) {

    function Router() {
    
        var _routes = [];

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

        var matchRoute = function(url) {
            var route = null;
            for(var i = 0; route = _routes[i]; i ++) {

                var routeExec = route.regex.regexp.exec(url);
                var routeMatch = (routeExec) ? true : false;

                if(routeMatch) {

                    var params = {};
                    for(var g in route.regex.groups) {
                        var group = route.regex.groups[g];
                        params[g] = routeExec[group + 1];
                    }

                    route.callback({"url": url, "params": params});
                    return true;
                }
            }

            return false;
        };

        this.get = function(route, callback) {
            _routes.push({regex: this.parseRoute(route), "callback": callback});
        };

        this.getRoutes = function() {
            return _routes;
        };

        this.init = function() {
            matchRoute(window.location.pathname);
        };

    }

    return Router;
});
