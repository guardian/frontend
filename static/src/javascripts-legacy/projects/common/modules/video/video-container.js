define([
    'bean',
    'lib/fastdom-promise',
    'lib/$',
    'lib/element-inview',
    'bootstraps/enhanced/media/video-player',
    'lodash/objects/assign',
    'lib/create-store',
    'common/modules/atoms/youtube',
    'lib/detect'
], function (
    bean,
    fastdom,
    $,
    ElementInview,
    videojs,
    assign,
    createStore,
    youtube,
    detect
)
{
    function updateYouTubeVideo(currentItem){
        var youTubeAtom = currentItem.querySelector('.youtube-media-atom');
        if(youTubeAtom) {
         return youtube.onVideoContainerNavigation(youTubeAtom.dataset.uniqueAtomId);
        }
    }

    var reducers = {
        NEXT: function next(previousState) {
            var position = previousState.position >= previousState.length ? previousState.position : previousState.position + 1;
            updateYouTubeVideo(document.querySelector('.js-video-playlist-item-'+ (position-1)));
            return assign({}, previousState, getPositionState(position, previousState.length));
        },

        PREV: function prev(previousState) {
            var position = previousState.position <= 0 ? 0 : previousState.position - 1;
            updateYouTubeVideo(document.querySelector('.js-video-playlist-item-'+ (position+1)));
            return assign({}, previousState, getPositionState(position, previousState.length));
        },

        INIT: function init(previousState) {
            function makeYouTubeNonPlayableAtSmallBreakpoint(previousState) {
                if(detect.isBreakpoint({max: 'desktop'})){
                 var youTubeIframes = previousState.container.querySelectorAll('.youtube-media-atom iframe');
                 youTubeIframes.forEach(function(el){
                     el.remove();
                 });
                 var overlayLinks = previousState.container.querySelectorAll('.video-container-overlay-link');
                 overlayLinks.forEach(function(el){
                     el.classList.add('u-faux-block-link__overlay');
                 });

                 var atomWrapper = previousState.container.querySelectorAll('.youtube-media-atom');
                 atomWrapper.forEach(function(el){
                     el.classList.add('no-player');
                 })
                }
            }
            makeYouTubeNonPlayableAtSmallBreakpoint(previousState);

            fastdom.read(function() {
                // Lazy load images on scroll for mobile
                $('.js-video-playlist-image', previousState.container).each(function(el) {
                    var elementInview = ElementInview(el , $('.js-video-playlist-inner', previousState.container).get(0), {
                        // This loads 1 image in the future
                        left: 410
                    });

                    elementInview.on('firstview', function(el) {
                        fastdom.write(function() {
                            var dataSrc = el.getAttribute('data-src');
                            var src = el.getAttribute('src');

                            if (dataSrc && !src) {
                                fastdom.write(function() {
                                    el.setAttribute('src', dataSrc);
                                });
                            }
                        });
                    });
                });
            });
            return previousState;
        }
    };

    function fetchLazyImage(container, i) {
        $('.js-video-playlist-image--' + i, container).each(function(el) {
            fastdom.read(function () {
                var dataSrc = el.getAttribute('data-src');
                var src = el.getAttribute('src');
                return dataSrc && !src ? dataSrc : null;
            }).then(function(src) {
                if (src) {
                    fastdom.write(function() {
                        el.setAttribute('src', src);
                    });
                }
            });
        });
    }

    function update(state, container) {
        var translateWidth = -state.videoWidth * state.position;

        return fastdom.write(function() {
            container.querySelector('.video-playlist__item--active').classList.remove('video-playlist__item--active');
            container.querySelector('.js-video-playlist-item-' + state.position).classList.add('video-playlist__item--active');

            container.classList.remove('video-playlist--end', 'video-playlist--start');
            if (state.atEnd) {
                container.classList.add('video-playlist--end');
            } else if (state.atStart) {
                container.classList.add('video-playlist--start');
            }

            // fetch the next image (for desktop)
            fetchLazyImage(container, state.position + 1);

            // pause all players (we should potentially think about this site wide)
            $('.js-video-playlist .vjs').each(function(el) {
                videojs($(el)[0]).pause();
            });

            container.querySelector('.js-video-playlist-item-' + state.position).classList.add('video-playlist__item--active');
            container.querySelector('.js-video-playlist-inner').setAttribute('style',
                '-webkit-transform: translate(' + translateWidth + 'px);' +
                'transform: translate(' + translateWidth + 'px);'
            );
        });
    }

    function getPositionState(position, length) {
        return {
            position: position,
            atStart: position === 0,
            atEnd: position >= length
        };
    }

    function getInitialState(container) {
        return {
            position: 0,
            length: container.getAttribute('data-number-of-videos'),
            videoWidth: 700,
            container: container
        };
    }

    function setupDispatches(dispatch, container) {
        bean.on(container, 'click', '.js-video-playlist-next', function() {
            dispatch({ type: 'NEXT' });
        });

        bean.on(container, 'click', '.js-video-playlist-prev', function() {
            dispatch({ type: 'PREV' });
        });
    }

    function reducer(previousState, action) {
        return reducers[action.type] ? reducers[action.type](previousState) : previousState;
    }

    return {
        init: function(container) {
            var initialState = getInitialState(container);
            var store = createStore(reducer, initialState);

            setupDispatches(store.dispatch, container);
            store.subscribe(function() {
                update(store.getState(), container);
            });
        }
    };
});
