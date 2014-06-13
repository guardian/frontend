define([
    'qwery',
    'bean',
    'common/$',
    'common/utils/ajax'
], function(
    qwery,
    bean,
    $,
    ajax
) {

    function init() {

        var $adsRenderTime = $('.render-time--ads'),
            $adRenderTime = $('.render-time--ad');

        $adsRenderTime.addClass('graph-loading');
        ajax({
            url: '/ophan/ads/render-time?platform=next-gen',
            type: 'json'
        }).then(
            function(nextGenData) {
                ajax({
                    url: '/ophan/ads/render-time?platform=r2',
                    type: 'json'
                }).then(function(r2Data) {

                    var graphData = [['Time', 'R2', 'Next-Gen']].concat(nextGenData.buckets.map(function(bucket, i) {
                        return [
                            new Date(bucket.time),
                            (r2Data.buckets[i].avgTimeToRenderEnded)/1000,
                            bucket.avgTimeToRenderEnded/1000
                        ];
                    }));

                    new google.visualization.LineChart(qwery('#render-time--ads__graph')[0])
                        .draw(google.visualization.arrayToDataTable(graphData), {
                            fontName: 'Georgia',
                            title: 'Ads\' average render time (secs)',
                            titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                            vAxis: {format: '#,###'},
                            hAxis: {format: 'HH:mm'}
                        });

                }).always(function() {
                    $adsRenderTime.removeClass('graph-loading');
                }).fail(function() {
                    $adsRenderTime.addClass('graph-failed');
                })
            }
        );

        function daramAdRenderTime(adSlotName) {

            $adRenderTime.addClass('graph-loading');
            ajax({
                url: '/ophan/ads/render-time?platform=next-gen&ad-slot=' + adSlotName,
                type: 'json'
            }).then(function(data) {

                var graphData = [['Time', 'Next-Gen']].concat(data.buckets.map(function(bucket) {
                    return [
                        new Date(bucket.time),
                        bucket.avgTimeToRenderEnded/1000
                    ];
                }));

                new google.visualization.LineChart(qwery('#render-time--ad__graph')[0])
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        fontName: 'Georgia',
                        legend: 'none',
                        title: 'Ad\'s average render time (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        vAxis: {format: '#,###'},
                        hAxis: {format: 'HH:mm'}
                    });
            }).always(function() {
                $adRenderTime.removeClass('graph-loading');
            }).fail(function() {
                $adRenderTime.addClass('graph-failed');
            })
        };

        var $select = $.create('<select></select>');
        [
            'top-above-nav',
            'top',
            'inline1',
            'inline2',
            'right',
            'merchandising-high',
            'merchandising'
        ].forEach(function(adSlotName, i) {
                $.create('<option></option>')
                    .val(adSlotName)
                    .text(adSlotName)
                    .attr('selected', i === 0)
                    .appendTo($select);
            });
        $.create('<form></form>')
            .addClass('render-time--ad__form')
            .append($select)
            .prependTo(qwery('.render-time--ad')[0]);

        bean.on($select[0], 'change', function(e) {
            $('#render-time--ad__graph').html('');
            daramAdRenderTime(e.target.value);
        });

        daramAdRenderTime($select.val());

    };

    return {
        init: init
    };

});
