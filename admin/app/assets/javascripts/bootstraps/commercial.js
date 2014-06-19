define([
    'qwery',
    'bean',
    'lodash/collections/where',
    'common/$',
    'common/utils/ajax'
], function(
    qwery,
    bean,
    where,
    $,
    ajax
) {

    function getQuery() {
        return window.location.search.substring(1);
    };

    function init() {

        var $adsRenderTime = $('.render-time--ads'),
            $adRenderTime = $('.render-time--ad');

        $adsRenderTime
            .removeClass('ajax-failed')
            .addClass('ajax-loading');
        ajax({
            url: '/ophan/ads/render-time?platform=next-gen',
            type: 'json'
        }).then(function(nextGenData) {
            ajax({
                url: '/ophan/ads/render-time?platform=r2',
                type: 'json'
            }).then(function(r2Data) {
                var r2Buckets = r2Data.buckets,
                    graphData = [['Time', 'Next-Gen', 'R2']].concat(nextGenData.buckets.map(function(bucket) {
                        var r2Bucket = where(r2Buckets, {time: bucket.time});
                        return [
                            new Date(bucket.time),
                            Math.max(bucket.avgTimeToRenderEnded/1000, 0),
                            r2Bucket.length ? Math.max(r2Bucket.shift().avgTimeToRenderEnded/1000, 0) : 0
                        ];
                    }));


                new google.visualization.LineChart(qwery('#render-time--ads__graph')[0])
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        fontName: 'Georgia',
                        title: 'Average render time across all ad slots (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        hAxis: {format: 'HH:mm'}
                    });

            }).always(function() {
                $adsRenderTime.removeClass('ajax-loading');
            }).fail(function() {
                $adsRenderTime.addClass('ajax-failed');
            })
        }).fail(function() {
            $adsRenderTime
                .removeClass('ajax-loading')
                .addClass('ajax-failed');
        });

        function darawAdRenderTime(adSlotName) {

            $adRenderTime
                .removeClass('ajax-failed')
                .addClass('ajax-loading');
            ajax({
                url: '/ophan/ads/render-time/dfp-ad--' + adSlotName + '?platform=next-gen',
                type: 'json'
            }).then(function(data) {
                var graphData = [['Time', 'Next-Gen']].concat(data.buckets.map(function(bucket) {
                    return [
                        new Date(bucket.time),
                        Math.max(bucket.avgTimeToRenderEnded/1000, 0)
                    ];
                }));

                new google.visualization.LineChart(qwery('#render-time--ad__graph')[0])
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        fontName: 'Georgia',
                        legend: 'none',
                        title: 'Average render time for a particular ad slot (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        hAxis: {format: 'HH:mm'},
                        trendlines: {0: {color: 'green'}}
                    });
            }).always(function() {
                $adRenderTime.removeClass('ajax-loading');
            }).fail(function() {
                $adRenderTime.addClass('ajax-failed');
            })
        };

        var adSlot = /[?&]ad-slot=([^&]+)/.exec(document.location.search),
            $select = $.create('<select></select>')
                .addClass('render-time--ad__form__select'),
            $label = $.create('<label></label>')
                .addClass('render-time--ad__form__label')
                .text('Ad slot:')
                .append($select);

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
                    .attr('selected', adSlot ? adSlot[1] === adSlotName : i === 0)
                    .appendTo($select);
            });
        $.create('<form></form>')
            .addClass('render-time--ad__form')
            .append($label)
            .prependTo(qwery('.render-time--ad')[0]);

        bean.on($select[0], 'change', function(e) {
            var adSlot = e.target.value;
            window.history.pushState({}, '', '?ad-slot=' + adSlot + '&' + getQuery());
            $('#render-time--ad__graph').html('');
            daramAdRenderTime(adSlot);
        });

        darawAdRenderTime($select.val());

    };

    return {
        init: init
    };

});
