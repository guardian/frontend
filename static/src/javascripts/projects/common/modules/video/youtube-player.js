define([
    'fastdom',
    'Promise',
    'common/utils/$',
    'common/utils/load-script',
    'lodash/collections/forEach'
], function (
    fastdom,
    Promise,
    $,
    loadScript,
    forEach
) {
    var scriptId = 'youtube-player';
    var scriptSrc = 'https://www.youtube.com/player_api';
    var promise = new Promise(function(resolve) {
        window.onYouTubeIframeAPIReady = resolve;
    });

    fastdom.write(function () {
        loadScript({ id: scriptId, src: scriptSrc });
    }, this);

    function prepareWrapper(el) {
        var wrapper = document.createElement('div');
        var attrs = el.attributes;

        forEach(attrs, function (attribute) {
            //parent div should have the same class names
            if (attribute.name === 'class') {
                wrapper.className += attribute.value;
            } else if (attribute.name === 'id') {
                //parent div should have almost the same id (without the `_iframe` part)
                wrapper.id = attribute.value;
                el.id += '_iframe';
            } else if (attribute.name.substring(0, 5) === 'data-') {
                //copy all of the data- attributes
                wrapper.setAttribute(attribute.name, attribute.value);
            }
        });

        fastdom.write(function () {
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);
        });

        return wrapper;
    }

    function _onPlayerStateChange(event, handlers, wrapper) {
        //change class according to the current state
        fastdom.write(function () {
            ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function (status) {
                wrapper.classList.toggle('youtube__video-' + status.toLocaleLowerCase(), event.data === window.YT.PlayerState[status]);
            });
            wrapper.classList.add('youtube__video-started');
        });
        if (handlers && typeof handlers.onPlayerStateChange === 'function') {
            handlers.onPlayerStateChange(event);
        }
    }

    function _onPlayerReady(event, handlers, wrapper) {
        fastdom.write(function () {
            wrapper.classList.add('youtube__video-ready');
        });
        if (handlers && typeof handlers.onPlayerReady === 'function') {
            handlers.onPlayerReady(event);
        }
    }

    function init(el, handlers) {
        //wrap <iframe/> in a div with almost the same class, id and data- attributes
        var wrapper = prepareWrapper(el);

        return promise.then(function () {
            function onPlayerStateChange(event) {
                _onPlayerStateChange(event, handlers, wrapper);
            }

            function onPlayerReady(event) {
                _onPlayerReady(event, handlers, wrapper);
            }

            return new window.YT.Player(el.id, {
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        });
    }

    return {
        init: init
    };
});
