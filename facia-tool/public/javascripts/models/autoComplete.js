define([
    'Reqwest',
    'models/common',
    'models/cache'
],
function (
    Reqwest,
    common,
    cache
){
    var maxItems = 50,
        counter = 0;

    return function (opts) {
        var q = opts.query || '',
            path = opts.path || "tags",
            url  = "/" + path + "?q=" + q,
            data,
            count;

        if(!q.match(/[a-z0-9]+/i)) {
            opts.receiver([]);
            return;
        }

        data = cache.get('contentApi', url);
        counter += 1;

        if(data) {
            opts.receiver(data);
        } else {
            opts.receiver([{_alert : "searching for " + path + "..."}]);
            count = counter;

            new Reqwest({
                url: common.config.apiSearchBase + url + "&page-size=" + maxItems,
                type: 'jsonp'
            }).always(
                function(resp) {
                    var results;

                    if (count !== counter) {
                        return;
                    }

                    results = resp.response && resp.response.results ? resp.response.results : false;

                    if (!results) {
                        opts.receiver([{_alert : "...sorry, there was an error."}]);
                        return;
                    }

                    if (results.length === 0) {
                        results = [{_alert : "...sorry, no " + path + " found."}];
                    }

                    cache.put('contentApi', url, results);
                    opts.receiver(results);
                }
            );
        }
    }
});
