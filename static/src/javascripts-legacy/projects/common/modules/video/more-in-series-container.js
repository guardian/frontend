define(
    [
        'common/modules/component',
        'lib/mediator',
        'common/modules/atoms/youtube',
    ],
    function(Component, mediator, youtube) {
        function init(el, mediaType, section, shortUrl, series) {
            var component = new Component();
            var endpoint =
                '/' +
                mediaType +
                '/section/' +
                section +
                (series ? '/' + series : '') +
                '.json?shortUrl=' +
                shortUrl +
                // exclude professional network content from video pages
                (mediaType === 'video'
                    ? '&exclude-tag=guardian-professional/guardian-professional'
                    : '');

            component.endpoint = endpoint;

            component.fetch(el).then(function() {
                youtube.checkElemsForVideos(el);
                mediator.emit('page:media:moreinloaded', el);
                mediator.emit('page:new-content', el);
            });
        }

        return { init: init };
    }
);
