/*global google*/
define([
    'qwery',
    'bean',
    'bonzo',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/url'
], function (
    qwery,
    bean,
    bonzo,
    _,
    $,
    ajax,
    urlUtils
) {

    function getHours() {
        var hours =  /[?&]hours=([^&]*)/.exec(window.location.search);
        return hours ? hours[1] : 24;
    }

    function init() {

        var $adsRenderTime = $('.render-time--ads'),
            $adRenderTime = $('.render-time--ad');

        $adsRenderTime
            .removeClass('ajax-failed')
            .addClass('ajax-loading');
        ajax({
            url: '/ophan/ads/render-time?' + urlUtils.constructQuery({ platform: 'next-gen', hours: getHours() }),
            type: 'json'
        }).then(function (nextGenData) {
            ajax({
                url: '/ophan/ads/render-time?' + urlUtils.constructQuery({ platform: 'r2', hours: getHours() }),
                type: 'json'
            }).then(function (r2Data) {
                var r2Buckets = r2Data.buckets,
                    graphData = [['Time', 'Next Gen', 'R2']].concat(nextGenData.buckets.map(function (bucket) {
                        var r2Bucket = _.where(r2Buckets, {time: bucket.time});
                        return [
                            new Date(bucket.time),
                            Math.max(bucket.avgTimeToRenderEnded / 1000, 0),
                            r2Bucket.length ? Math.max(r2Bucket.shift().avgTimeToRenderEnded / 1000, 0) : 0
                        ];
                    }));


                new google.visualization.LineChart(qwery('#render-time--ads__graph')[0])
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        fontName: 'Georgia',
                        title: 'Average render time across all ad slots (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        hAxis: {format: 'HH:mm'}
                    });

            }).always(function () {
                $adsRenderTime.removeClass('ajax-loading');
            }).fail(function () {
                $adsRenderTime.addClass('ajax-failed');
            });
        }).fail(function () {
            $adsRenderTime
                .removeClass('ajax-loading')
                .addClass('ajax-failed');
        });

        function drawAdRenderTime(adSlotName) {

            $adRenderTime
                .removeClass('ajax-failed')
                .addClass('ajax-loading');
            ajax({
                url: '/ophan/ads/render-time?' + urlUtils.constructQuery({
                    'ad-slot': 'dfp-ad--' + adSlotName,
                    platform: 'next-gen',
                    hours: getHours()
                }),
                type: 'json'
            }).then(function (data) {
                var graphData = [['Time', 'Next-Gen']].concat(data.buckets.map(function (bucket) {
                    return [
                        new Date(bucket.time),
                        Math.max(bucket.avgTimeToRenderEnded / 1000, 0)
                    ];
                }));

                new google.visualization.LineChart(qwery('#render-time--ad__graph')[0])
                    .draw(google.visualization.arrayToDataTable(graphData), {
                        fontName: 'Georgia',
                        legend: 'none',
                        title: 'Average render time for a particular ad slot on Next Gen (secs)',
                        titleTextStyle: {fontName: 'Georgia', color: '#222', italic: true, bold: false},
                        hAxis: {format: 'HH:mm'},
                        trendlines: {0: {color: 'green'}}
                    });
            }).always(function () {
                $adRenderTime.removeClass('ajax-loading');
            }).fail(function () {
                $adRenderTime.addClass('ajax-failed');
            });
        }

        // Update filter
        qwery('.ad-render-filter__time .dropdown-menu a').forEach(function (opt) {
            var $opt = bonzo(opt);
            if ($opt.attr('href') === '?hours=' + getHours()) {
                $opt.parent().addClass('active');
            }
        });

        // Add ad slot selection
        var adSlot = /[?&]ad-slot=([^&]+)/.exec(document.location.search),
            $select = $.create('<select></select>')
                .addClass('form-control render-time--ad__form__select'),
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
        ].forEach(function (adSlotName, i) {
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

        bean.on($select[0], 'change', function (e) {
            var adSlot = e.target.value;
            window.history.pushState({}, '', '?ad-slot=' + adSlot + '&hours=' + getHours());
            $('#render-time--ad__graph').html('');
            drawAdRenderTime(adSlot);
        });

        drawAdRenderTime($select.val());

    }

    return {
        init: init
    };

});
