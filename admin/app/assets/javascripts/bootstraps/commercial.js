define([
    'common/utils/ajax'
], function(
    ajax
) {

    function init() {

        function padTime(time) {
            return ('0' +  time).slice(-2);
        };

        ajax({
            url: '/ophan/ads/render-time',
            type: 'json'
        }).then(
            function(data) {

                var graphData = [['time', 'avg-render-time']].concat(data.buckets.reverse().map(function(bucket) {
                    return [
                        new Date(bucket.time),
                        bucket.avgTimeToRenderEnded/1000
                    ];
                }));

                new google.visualization.LineChart(document.getElementById('ads-render-time'))
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        title: 'Ads average render time',
                        backgroundColor: '#fff',
                        colors: ['#333'],
                        height: 125,
                        legend: 'none',
                        fontName: 'Georgia',
                        titleTextStyle: {color: '#999'},
                        vAxis: {format: '#,###s'},
                        hAxis: {format: 'HH:mm'},
                        trendlines: {0: {type: 'exponential', color: 'green'}}
                    });
            }
        )
    };

    return {
        init: init
    };

});
