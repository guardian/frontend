// @flow
import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import { elementInView } from 'lib/element-inview';
import { onVideoContainerNavigation } from 'common/modules/atoms/youtube';
import { isBreakpoint } from 'lib/detect';

type Action = {
    type: string,
};

type Position = {
    position: number,
    atStart?: boolean,
    atEnd?: boolean,
};

type State = Position & {
    length: number,
    videoWidth: number,
    container: Element,
};

const updateYouTubeVideo = (currentItem: ?Element): void => {
    if (currentItem != null) {
        const youTubeAtom = currentItem.querySelector('.youtube-media-atom');
        if (youTubeAtom) {
            const atomId = youTubeAtom.getAttribute('data-unique-atom-id');
            if (atomId) {
                return onVideoContainerNavigation(atomId);
            }
        }
    }
};

const getPositionState = (position: number, length: number): Position => ({
    position,
    atStart: position === 0,
    atEnd: position >= length,
});

const reducers = {
    NEXT: function next(previousState: State): State {
        const position =
            previousState.position >= previousState.length
                ? previousState.position
                : previousState.position + 1;

        updateYouTubeVideo(
            document.querySelector(`.js-video-playlist-item-${position - 1}`)
        );
        return Object.assign(
            {},
            previousState,
            getPositionState(position, previousState.length)
        );
    },

    PREV: function prev(previousState: State): State {
        const position =
            previousState.position <= 0 ? 0 : previousState.position - 1;
        updateYouTubeVideo(
            document.querySelector(`.js-video-playlist-item-${position + 1}`)
        );
        return Object.assign(
            {},
            previousState,
            getPositionState(position, previousState.length)
        );
    },

    INIT: function init(previousState: State): State {
        const makeYouTubeNonPlayableAtSmallBreakpoint = state => {
            if (
                isBreakpoint({
                    max: 'desktop',
                })
            ) {
                const youTubeIframes = Array.from(
                    state.container.querySelectorAll(
                        '.youtube-media-atom iframe'
                    )
                );
                youTubeIframes.forEach(el => {
                    el.remove();
                });
                const overlayLinks = Array.from(
                    state.container.querySelectorAll(
                        '.video-container-overlay-link'
                    )
                );
                overlayLinks.forEach(el => {
                    el.classList.add('u-faux-block-link__overlay');
                    // make visible to screen readers / keyboard users
                    el.removeAttribute('tabindex');
                    el.removeAttribute('aria-hidden');
                });

                const atomWrapper = Array.from(
                    state.container.querySelectorAll('.youtube-media-atom')
                );
                atomWrapper.forEach(el => {
                    el.classList.add('no-player');
                });
            }
        };
        makeYouTubeNonPlayableAtSmallBreakpoint(previousState);

        fastdom.read(() => {
            // Lazy load images on scroll for mobile
            $('.js-video-playlist-image', previousState.container).each(el => {
                const inview = elementInView(
                    el,
                    $('.js-video-playlist-inner', previousState.container).get(
                        0
                    ),
                    {
                        // This loads 1 image in the future
                        left: 410,
                    }
                );

                inview.on('firstview', elem => {
                    fastdom.write(() => {
                        const dataSrc = elem.getAttribute('data-src');
                        const src = elem.getAttribute('src');

                        if (dataSrc && !src) {
                            fastdom.write(() => {
                                elem.setAttribute('src', dataSrc);
                            });
                        }
                    });
                });
            });
        });
        return previousState;
    },
};

const fetchLazyImage = (container: Element, i: number): void => {
    $(`.js-video-playlist-image--${i}`, container).each(el => {
        fastdom
            .read(() => {
                const dataSrc = el.getAttribute('data-src');
                const src = el.getAttribute('src');
                return dataSrc && !src ? dataSrc : null;
            })
            .then(src => {
                if (src) {
                    fastdom.write(() => {
                        el.setAttribute('src', src);
                    });
                }
            });
    });
};

const update = (state: State, container: Element): Promise<number> => {
    const translateWidth = -state.videoWidth * state.position;

    return fastdom.write(() => {
        const activeEl = container.querySelector(
            '.video-playlist__item--active'
        );

        if (activeEl != null) {
            activeEl.classList.remove('video-playlist__item--active');
            $('.youtube-media-atom__iframe', activeEl).hide();
            $('.video-overlay .fc-item__link', activeEl).attr('tabindex', '-1');
            $('.video-overlay .fc-item__link', activeEl).attr(
                'aria-hidden',
                'true'
            );
        }

        const newActive = container.querySelector(
            `.js-video-playlist-item-${state.position}`
        );

        if (newActive != null) {
            newActive.classList.add('video-playlist__item--active');
            $('.youtube-media-atom__iframe', newActive).show();
            $('.video-overlay .fc-item__link', newActive).removeAttr(
                'tabindex'
            );
            $('.video-overlay .fc-item__link', newActive).removeAttr(
                'aria-hidden'
            );
        }

        container.classList.remove(
            'video-playlist--end',
            'video-playlist--start'
        );

        if (state.atStart) {
            container.classList.add('video-playlist--start');
            $('.video-title__link', container).removeAttr('tabindex');
            $('.video-title__link', container).removeAttr('aria-hidden');
            $('.treats__treat', container).removeAttr('tabindex');
            $('.treats__treat', container).removeAttr('aria-hidden');
            $('.js-video-playlist-prev', container).attr('aria-hidden', 'true');
            $('.js-video-playlist-prev', container).attr('tabindex', '-1');
        } else {
            $('.video-title__link', container).attr('tabindex', '-1');
            $('.video-title__link', container).attr('aria-hidden', 'true');
            $('.treats__treat', container).attr('tabindex', '-1');
            $('.treats__treat', container).attr('aria-hidden', 'true');
            $('.js-video-playlist-prev', container).removeAttr('aria-hidden');
            $('.js-video-playlist-prev', container).attr('tabindex', '0');
        }

        if (state.atEnd) {
            container.classList.add('video-playlist--end');
            $('.js-video-playlist-next', container).attr('aria-hidden', 'true');
            $('.js-video-playlist-next', container).attr('tabindex', '-1');
        } else {
            $('.js-video-playlist-next', container).removeAttr('aria-hidden');
            $('.js-video-playlist-next', container).attr('tabindex', '0');
        }

        // fetch the next image (for desktop)
        fetchLazyImage(container, state.position + 1);

        const activePlaylistItem = container.querySelector(
            `.js-video-playlist-item-${state.position}`
        );
        if (activePlaylistItem != null)
            activePlaylistItem.classList.add('video-playlist__item--active');

        const playlistInner = container.querySelector(
            '.js-video-playlist-inner'
        );
        if (playlistInner != null)
            playlistInner.setAttribute(
                'style',
                `-webkit-transform: translate(${translateWidth}px);` +
                    `transform: translate(${translateWidth}px);`
            );
    });
};

const getInitialState = (container: Element): State => ({
    position: 0,
    length: Number(container.getAttribute('data-number-of-videos')),
    videoWidth: 700,
    container,
});

const setupDispatches = (
    dispatch: (a: Action) => void,
    container: Element
): void => {
    bean.on(container, 'click', '.js-video-playlist-next', () => {
        dispatch({
            type: 'NEXT',
        });
    });

    bean.on(container, 'keypress', '.js-video-playlist-next', e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            dispatch({
                type: 'NEXT',
            });
        }
    });

    bean.on(container, 'click', '.js-video-playlist-prev', () => {
        dispatch({
            type: 'PREV',
        });
    });

    bean.on(container, 'keypress', '.js-video-playlist-prev', e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            dispatch({
                type: 'PREV',
            });
        }
    });
};

const reducer = (previousState: State, action: Action): State =>
    reducers[action.type]
        ? reducers[action.type](previousState)
        : previousState;

const createStore = (
    storeReducer: (s: State, a: Action) => State,
    initialState: State
) => {
    // We re-assign this over time
    let state = initialState;
    const subscribers = [];

    const notify = () => {
        subscribers.forEach(fn => {
            fn();
        });
    };
    const dispatch = action => {
        state = storeReducer(state, action);
        notify();
    };
    const subscribe = fn => {
        subscribers.push(fn);
    };
    const getState = () => state;

    dispatch({
        type: 'INIT',
    });

    return {
        dispatch,
        subscribe,
        getState,
    };
};

export const videoContainerInit = (container: Element) => {
    const initialState = getInitialState(container);
    const store = createStore(reducer, initialState);

    setupDispatches(store.dispatch, container);
    store.subscribe(() => {
        update(store.getState(), container);
    });

    $('.video-playlist__item:not(.video-playlist__item--first)').each($el => {
        $('.youtube-media-atom__iframe', $el).hide();
        $('.video-overlay .fc-item__link', $el).attr('tabindex', '-1');
        $('.video-overlay .fc-item__link', $el).attr('aria-hidden', 'true');
    });
};
