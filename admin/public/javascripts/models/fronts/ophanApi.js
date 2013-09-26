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
        items.slice(0, 50).forEach(function(item, index){
            var id = item.meta.id(),
                data;

            if (!id) { return; }

            data = cache.get('ophan', id);

            if (data) {
                decorateItem(item, data);
                return;
            }

            setTimeout(function(){
                fetchData(id, function(resp){
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
            groups = [
                {name: 'Other',    data: [], color: 'd61d00', max: 0}, // required
                {name: 'Google',   data: [], color: '89A54E', max: 0},
                {name: 'Guardian', data: [], color: '4572A7', max: 0}
            ];

        if(data.seriesData && data.seriesData.length) {
            _.each(data.seriesData, function(s){

                // Pick the relevant group...
                var group = _.find(groups, function(g){
                        return g.name === s.name;
                    }) || groups[0]; // ...defaulting to the first ('Other')

                // How many 1 min points are we adding into each slot
                var minsPerSlot = Math.max(1, Math.floor(s.data.length / slots));

                // ...sum the data into each group
                _.each(_.last(s.data, minsPerSlot*slots), function(d,index) {
                    var i = Math.floor(index / minsPerSlot);
                    group.data[i] = (group.data[i] || 0) + (d.count / minsPerSlot);
                    group.max = Math.max(group.max, group.data[i]);
                });
            });

            return _.map(groups, function(group){
                // recent pageviews per minute average
                var pvm = _.reduce(_.last(group.data, common.config.pvmPeriod), function(m, n){ return m + n; }, 0) / common.config.pvmPeriod;
                // classify activity on scale of 1,2,3
                group.activity = pvm < common.config.pvmHot ? pvm < common.config.pvmWarm ? 1 : 2 : 3;
                // Round the datapoints
                group.data = _.map(group.data, function(d) { return Math.round(d*10)/10; });
                return group;
            });
        }
    }

    function fetchData(id, callback) {
        cache.put('ophan', id, {failed: true});

        Reqwest({
            url: '/ophan/pageviews/' + id,
            type: 'json'
        }).then(
            function (resp) {
                _.each(resp.seriesData, function(s){
                    s.data.pop(); // Drop the last data point
                })
                callback(resp);
            }
        );
    }

    return {
        decorateItems: decorateItems
    }

});
