define([
    'models/common',
    'modules/authedAjax',
    'modules/cache'
],
function (
    common,
    authedAjax,
    cache
){
    var maxItems = 50,
        counter = 0;

    return function (opts) {
        var defer = $.Deferred(),
            q = opts.query || '',
            path = opts.path || "tags",
            url  = "/" + path + "?q=" + q,
            count = counter += 1,
            results;

        if(!q.match(/[a-z0-9]+/i)) {
            defer.resolve([]);
        }

        results = cache.get('contentApi', url);

        if(results) {
            defer.resolve(results);
        } else {
            defer.notify([{_alert : "searching for " + path + "..."}]);

            authedAjax.request({
                url: common.config.apiSearchBase + url + "&page-size=" + maxItems
            }).then(
                function(resp) {
                    var results = resp.response && resp.response.results ? resp.response.results : false;

                    if (!results) {
                        defer.resolve();
                        return;
                    }

                    cache.put('contentApi', url, results);

                    if (count !== counter) {
                        defer.resolve();
                        return;
                    }

                    if (results.length === 0) {
                        defer.resolve([{_alert : "...sorry, no " + path + " found."}]);
                        return;
                    }

                    defer.resolve(results);
                }
            );
        }

        return defer;
    }
});
