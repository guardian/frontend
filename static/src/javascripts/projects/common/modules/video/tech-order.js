define([
    'common/utils/$',
    'common/utils/config',
    'lodash/collections/contains',
    'lodash/arrays/compact',
    'lodash/collections/map',
    'common/utils/chain'
], function ($, config, contains, compact, map, chain) {

    var codecs = {
        'video/m3u8': 'video/m3u8; codecs="avc1.42C01e, mp4a.40.2"',
        'video/mp4': 'video/mp4; codecs="avc1.42C01e, mp4a.40.2"',
        'video/3gp:large': 'video/3gp:large; codecs="avc1.42C01e, mp4a.40.2"',
        'video/3gp:small': 'video/3gp:small; codecs="avc1.42C01e, mp4a.40.2"',
        'video/webm': 'video/webm; codecs="vp8, vorbis"'
    };

    function getMediaSources(el) {
        return $('source', el).map(function (source) {
            var type = source.getAttribute('type');
            return codecs[type] ? codecs[type] : type;
        });
    }

    function hasProbableHtml5Source(el) {
        return chain(getMediaSources(el)).and(map, function (type) {
                return el.canPlayType(type);
            }).and(compact).and(contains, 'probably').value();
    }

    return function priority(el) {
        var defaultPriority = ['flash', 'html5'];
        if (config.switches.html5MediaCompatibilityCheck) {
            return ('canPlayType' in el && hasProbableHtml5Source(el)) ? defaultPriority.reverse() : defaultPriority;
        } else {
            return defaultPriority;
        }
    };
});
