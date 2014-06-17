define([
    'qwery',
    'bean',
    'lodash/arrays/first',
    'common/$',
    'common/utils/ajax'
], function(
    qwery,
    bean,
    first,
    $,
    ajax
) {

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
                var graphData = [['Time', 'Next-Gen', 'R2']].concat(nextGenData.buckets.map(function(bucket, i) {
                    return [
                        new Date(bucket.time),
                        bucket.avgTimeToRenderEnded/1000,
                        first(r2Data.buckets, {time: bucket.time}).avgTimeToRenderEnded || 0
                    ];
                }));

                new google.visualization.LineChart(qwery('#render-time--ads__graph')[0])
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        fontName: 'Georgia',
                        title: 'Average render time across all ad slots (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        vAxis: {format: '#,###'},
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

        function daramAdRenderTime(adSlotName) {

            $adRenderTime
                .removeClass('ajax-failed')
                .addClass('ajax-loading');
            ajax({
                url: '/ophan/ads/render-time/' + adSlotName + '?platform=next-gen',
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
                        title: 'Average render time for a particular ad slot (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        vAxis: {format: '#,###'},
                        hAxis: {format: 'HH:mm'},
                        trendlines: {0: {type: 'exponential', color: 'green'}}
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
                    .val('dfp-ad--' + adSlotName)
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
            window.history.pushState({}, '', '?adSlot=' + adSlot);
            $('#render-time--ad__graph').html('');
            daramAdRenderTime(adSlot);
        });

        daramAdRenderTime($select.val());

    };

    return {
        init: init
    };

});
