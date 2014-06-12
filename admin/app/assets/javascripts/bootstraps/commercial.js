define([
    'common/utils/ajax',
    'common/$',
    'lodash/main'
], function(
    ajax,
    $,
    _
) {

    function init() {

        ajax({
            url: '/ophan/pageviews',
            type: 'json'
        }).then(
            function(data) {

                console.log(data);

//                var todayData = _.chain(data.seriesData)
//                                 .pluck('data')
//                                 .flatten()
//                                 .groupBy(function(entry) { return entry.dateTime })
//                                 .value();
//
//                // Remove first & last Ophan entries, as they always seem slightly off
//                var keys =  _.keys(todayData);
//                delete todayData[_.first(keys)];
//                delete todayData[_.last(keys)];
//
//                // Build Graph
//                var graphData = [['time', 'pageviews']];
//
//                _.each(todayData, function(viewsBreakdown, timestamp) {
//                    var epoch = parseInt(timestamp, 10),
//                        time  = new Date(epoch),
//                        hours = ("0" + time.getHours()).slice(-2),
//                        mins  = ("0" + time.getMinutes()).slice(-2),
//                        formattedTime = hours + ':' + mins,
//                        totalViews = _.reduce(viewsBreakdown, function(memo, entry) { return entry.count + memo }, 0);
//
//                    graphData.push([formattedTime, totalViews]);
//                });
//
//                new google.visualization.LineChart(document.getElementById('pageviews'))
//                    .draw(google.visualization.arrayToDataTable(graphData), {
//                        title: 'Page views',
//                        backgroundColor: '#fff',
//                        colors: ['#333'],
//                        height: 125,
//                        legend: 'none',
//                        fontName: 'Georgia',
//                        titleTextStyle: {color: '#999'},
//                        hAxis: { textStyle: {color: '#ccc'}, gridlines: { count: 0 }, showTextEvery: 15, baselineColor: '#fff' },
//                        smoothLine: true
//                    });
//
//                // Average pageviews now
//                var lastOphanEntry = _.chain(todayData)
//                    .values()
//                    .last()
//                    .reduce(function(memo, entry) { return entry.count + memo }, 0)
//                    .value();
//                var viewsPerSecond = Math.round(lastOphanEntry/60);
//                $('.pageviews-per-second').html('(' + viewsPerSecond + ' views/sec)');
            }
        )
    };

    return {
        init: init
    };

});
