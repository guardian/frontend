define([
    'fastdom',
    'common/utils/$',
    'bonzo',
    'bean',
    'Promise',
    'common/utils/load-script'
], function (
    fastdom,
    $,
    bonzo,
    bean,
    Promise,
    loadScript
) {
    var scriptId = 'youtube-player';
    var scriptSrc = 'https://www.youtube.com/player_api';
    var promise = new Promise(function(resolve) {
        window.onYouTubeIframeAPIReady = resolve;
    });

    fastdom.write(function () {
        loadScript({ id: scriptId, src: scriptSrc });
    }, this);

    return {
        init: function(el) {
            var wrapper = document.createElement('div');
            var attrs = el.attributes;
            Object.getOwnPropertyNames(attrs).forEach(function (attr) {
                var attribute = attrs[attr];
                if (attribute.name === 'class') {
                    wrapper.className = attribute.value;
                    el.classname = 'youtube-player';
                } else if (attribute.name === 'id') {
                    var id = attribute.value;
                    el.id += '_iframe';
                    wrapper.id = id;
                } else if(attribute.name !== 'src') {
                    wrapper.setAttribute(attribute.name, attribute.value);
                }
            });
            el.parentNode.insertBefore(wrapper, el);
            wrapper.appendChild(el);

            return promise.then(function () {
                function onPlayerStateChange(event) {
                    fastdom.write(function () {
                        ['ENDED', 'PLAYING', 'PAUSED', 'BUFFERING', 'CUED'].forEach(function (status) {
                            bonzo(wrapper).toggleClass('youtube__video-' + status.toLocaleLowerCase(), event.data === window.YT.PlayerState[status]);
                        });
                        bonzo(wrapper).addClass('youtube__video-started');
                    });
                }
                function onPlayerReady() {
                    fastdom.write(function () {
                        bonzo(wrapper).addClass('youtube__video-ready');
                    });
                }
                return new window.YT.Player(el.id, {
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange
                    }
                });
            });
        }
    };
});
