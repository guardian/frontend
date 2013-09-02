define([
    'Config',
    'Reqwest',
    'models/fronts/common',
    'models/fronts/cache'
], 
function (
    Config,
    Reqwest,
    common,
    cache
){
    function decorateItems(items) {
        items.slice(0, common.config.maxOphanCallsPerBlock).forEach(function(item){
            var id = item.meta.id(),
                data = cache.get('pageViews', id);

            if (!id) {
                return
            } else if (data && !data.failed) {
                decorateItem(data, item);
            } else if (data) {
                // noop. Cache'd a fail.
            } else {
                fetchData(id, function(data){
                    decorateItem(data, item);
                });
            }
        });
    };

    function decorateItem(data, item) {
        var simpleSeries,
            groups = [
                {name: 'Other',    data: [], color: 'd61d00', max: 0}, // required
                {name: 'Google',   data: [], color: '89A54E', max: 0},
                {name: 'Guardian', data: [], color: '4572A7', max: 0}
            ];

        if(data.totalHits) {
            item.state.pageViews(data.totalHits);
        }

        if(data.seriesData && data.seriesData.length) {
            _.each(data.seriesData, function(s){

                // Pick the relevant group...
                var group = _.find(groups, function(g){ 
                    return g.name === s.name;
                }) || groups[0]; // ...defaulting to the first ('Other')

                // ...sum the data into that group
                _.each(s.data, function(d,i) {
                    group.data[i] = (group.data[i] || 0) + d.count;
                    group.max = Math.max(group.max, group.data[i]);
                });
            });

            item.state.pageViewsSeries(groups);
        }
    }

    function fetchData(id, callback) {
        cache.put('pageViews', id, {failed: true});

        Reqwest({
            url: '/ophan/pageviews/' + id,
            type: 'json'
        }).then(
            function (resp) {
                callback(resp);
                cache.put('pageViews', id, resp);
            }
        );
    }

    return {
        decorateItems: decorateItems
    }

});
