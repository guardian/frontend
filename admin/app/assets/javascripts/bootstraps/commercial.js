define([
    'common/utils/ajax'
], function(
    ajax
) {

    function init() {

        var foo = ajax({
            url: '/ophan/ads/render-time',
            type: 'json'
        }).then(
            function(data) {

                var graphData = [['Time', 'Next-Gen']].concat(data.buckets.reverse().map(function(bucket) {
                    return [
                        new Date(bucket.time),
                        bucket.avgTimeToRenderEnded/1000
                    ];
                }));

                new google.visualization.LineChart(document.getElementById('ads-render-time'))
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        backgroundColor: '#fff',
                        colors: ['#333'],
                        fontName: 'Georgia',
                        title: 'Ads average render time (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        vAxis: {format: '#,###'},
                        hAxis: {format: 'HH:mm'}
                    });
            }
        );

        console.log(foo);
    };

    return {
        init: init
    };

});
