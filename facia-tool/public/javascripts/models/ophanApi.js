define([
    'Config',
    'models/authedAjax',
    'models/common',
    'models/cache'
],
function (
    Config,
    authedAjax,
    common,
    cache
){
    function decorateItems(items) {
        items.slice(0, 50).forEach(function(item, index){
            var id = item.props.id(),
                data;

            if (!id) { return; }

            data = cache.get('ophan', id);

            if (data) {
                decorateItem(item, data);
                return;
            }

            setTimeout(function(){
                fetchData(id)
                .then(function(resp){
                    decorateItem(
                        item,
                        cache.put('ophan', id, {
                            series: prepareSeries(resp),
                            totalHits: resp.totalHits
                        })
                    );
                });
            }, index * 1000/(common.config.ophanCallsPerSecond || 4)); // stagger requests
        });
    };

    function decorateItem(item, opts) {
        if(opts.totalHits !== item.state.totalHits()) {
            item.state.totalHits(opts.totalHits || 0);
            item.state.pageViewsSeries(opts.series);
        }
    }

    function prepareSeries(data) {
        var simpleSeries,
            slots = 100,
            graphs = [
                {name: 'Other',    data: [], color: 'd61d00', max: 0}, // required
                {name: 'Google',   data: [], color: '89A54E', max: 0},
                {name: 'Guardian', data: [], color: '4572A7', max: 0}
            ];

        if(data.seriesData && data.seriesData.length) {
            _.each(data.seriesData, function(s){

                // Pick the relevant graph...
                var graph = _.find(graphs, function(g){
                        return g.name === s.name;
                    }) || graphs[0]; // ...defaulting to the first ('Other')

                // How many 1 min points are we adding into each slot
                var minsPerSlot = Math.max(1, Math.floor(s.data.length / slots));

                // ...sum the data into each graph
                _.each(_.last(s.data, minsPerSlot*slots), function(d,index) {
                    var i = Math.floor(index / minsPerSlot);
                    graph.data[i] = (graph.data[i] || 0) + (d.count / minsPerSlot);
                    graph.max = Math.max(graph.max, graph.data[i]);
                });
            });

            return _.map(graphs, function(graph){
                // recent pageviews per minute average
                var pvm = _.reduce(_.last(graph.data, common.config.pvmPeriod), function(m, n){ return m + n; }, 0) / common.config.pvmPeriod;
                // classify activity on scale of 1,2,3
                graph.activity = pvm < common.config.pvmHot ? pvm < common.config.pvmWarm ? 1 : 2 : 3;
                // Round the datapoints
                graph.data = _.map(graph.data, function(d) { return Math.round(d*10)/10; });
                return graph;
            });
        }
    }

    function fetchData(id) {
        return authedAjax.request({
            url: '/ophan/pageviews/' + id
        }).then(function (resp) {
            _.each(resp.seriesData, function(s){
                s.data.pop(); // Drop the last data point
            })
            return resp;
        });
    }

    return {
        decorateItems: decorateItems
    }

});
