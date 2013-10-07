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

        if(data) {
            opts.receiver(data);
        } else {
            opts.receiver([{_alert : "searching for " + path + "..."}]);

            counter += 1;
            count = counter;

            new Reqwest({
                url: common.config.apiSearchBase + url + "&page-size=" + maxItems,
                type: 'jsonp'
            }).always(
                function(resp) {
                    var data;

                    if (count !== counter) { return; }
                    data = resp.response && resp.response.results ? resp.response.results : [];
                    if (data.length === 0) {
                        opts.receiver([{_alert : "...sorry, no " + path + " found."}]);
                        return;
                    }
                    cache.put('contentApi', url, data);
                    opts.receiver(data);
                }
            );
        }
    }
});
