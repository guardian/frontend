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
    var enable = _.has(common.util.queryParams(), 'pageViews');

    function decorateItems(items) {
        if (!enable) { return; }

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
        var simpleSeries;

        if(data.totalHits) {
            item.state.pageViews(data.totalHits);
        }

        if(data.seriesData && data.seriesData.length) {
            simpleSeries = data.seriesData.map(function(series) {
                return _.pluck(series.data, 'y')                
            })
            // Add all the series to the first series            
            _.rest(simpleSeries).forEach(function(simples) {
                simples.forEach(function(p, i){
                    _.first(simpleSeries)[i] += p;
                });
            });
            item.state.pageViewsSeries(_.first(simpleSeries));
        }
    }

    function fetchData(id, callback) {
        cache.put('pageViews', id, {failed: true});

        Reqwest({
            url: 'http://dashboard.ophan.co.uk/graph/breakdown/data?path=' + encodeURIComponent('/' + id),
            type: 'jsonp'
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
