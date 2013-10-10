define([
    'models/common',
    'models/authedAjax',
    'models/cache'
],
function (
    common,
    authedAjax,
    cache
){
    var maxItems = 50,
        counter = 0;

    return function (opts) {
        var receiver = opts.receiver || function () {},
            q = opts.query || '',
            path = opts.path || "tags",
            url  = "/" + path + "?q=" + q,
            data,
            count = counter += 1;

        if(!q.match(/[a-z0-9]+/i)) {
            receiver([]);
            return;
        }

        data = cache.get('contentApi', url);

        if(data) {
            receiver(data);
        } else {
            receiver([{_alert : "searching for " + path + "..."}]);

            authedAjax({
                url: common.config.apiSearchBase + url + "&page-size=" + maxItems
            }).then(
                function(resp) {
                    var results;

                    if (count !== counter) {
                        return;
                    }

                    results = resp.response && resp.response.results ? resp.response.results : false;

                    if (!results) {
                        receiver([{_alert : "...sorry, there was an error."}]);
                        return;
                    }

                    if (results.length === 0) {
                        results = [{_alert : "...sorry, no " + path + " found."}];
                    }

                    cache.put('contentApi', url, results);
                    receiver(results);
                }
            );
        }
    }
});
