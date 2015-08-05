//Client-side routing module
//Heavily inspired by https://github.com/PaulKinlan/leviroutes/blob/master/routes.js
define(function () {

    function Router() {

        var routes = [],
            matchRoute = function (url) {
                var i, routeExec, routeMatch, params, g, group,
                    route = null;
                /*eslint-disable no-cond-assign*/
                for (i = 0; route = routes[i]; i++) {
                    /*eslint-enable no-cond-assign*/

                    routeExec  = route.regex.regexp.exec(url);
                    routeMatch = (routeExec) ? true : false;

                    if (routeMatch) {

                        params = {};
                        for (g in route.regex.groups) {
                            group = route.regex.groups[g];
                            params[g] = routeExec[group + 1];
                        }

                        route.callback({url: url, params: params});
                        return true;
                    }
                }

                return false;
            };

        this.parseRoute = function (path) {
            this.parseGroups = function (loc) {
                var nameRegexp = new RegExp(':([^/.\\\\]+)', 'g'),
                    newRegexp = '' + loc,
                    groups = {},
                    matches = null,
                    i = 0;

                // Find the places to edit.
                /*eslint-disable no-cond-assign*/
                while (matches = nameRegexp.exec(loc)) {
                    /*eslint-enable no-cond-assign*/
                    groups[matches[1]] = i++;
                    newRegexp = newRegexp.replace(matches[0], '([^/.\\\\]+)');
                }

                newRegexp += '$'; // Only do a full string match

                return { groups: groups, regexp: new RegExp(newRegexp)};
            };

            return this.parseGroups(path);
        };

        this.get = function (route, callback) {
            routes.push({regex: this.parseRoute(route), callback: callback});
        };

        this.getRoutes = function () {
            return routes;
        };

        this.init = function () {
            matchRoute(window.location.pathname);
        };

    }

    return Router;
});
