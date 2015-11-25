define([
    'Promise',
    'bonzo',
    'bean',
    'fastdom',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/commercial/create-ad-slot',
    'common/modules/commercial/dfp-api',
    'lodash/functions/once',
    'lodash/functions/debounce',
    'lodash/arrays/rest',
    'lodash/collections/map',
    'lodash/collections/filter',
    'lodash/collections/forEach'
], function (
    Promise,
    bonzo,
    bean,
    fastdom,
    config,
    mediator,
    createAdSlot,
    dfp,
    once,
    debounce,
    drop,
    map,
    filter,
    forEach
) {
    var settings = {
        INTERVAL: 5,      // number of posts between ads
        OFFSET: 0.5,      // ratio of the screen height from which ads are loaded
        SCROLLTIMER: 50   // the time we wait before responding to a scroll event
    };

    var truncatedClass = 'truncated-block';

    // Keep a check if the module is currently listening to scroll events
    var listening = false;

    // Keep track of ad slots that are not yet initialized
    var slots = [];
    var slotCounter = 0;

    var posts, altitudes, firstPost, firstPostIndex, vh, vstart, voffset, onScrollDebounced;

    function init() {
        if ('complete' === document.readyState) {
            onLoad();
        } else {
            window.addEventListener('load', onLoad);
        }
        mediator.on('modules:autoupdate:updates', onUpdate);
    }

    function onLoad() {
        posts = document.querySelectorAll('.js-liveblog-body > .block');

        new Promise(function (resolve) {
            fastdom.read(function () {
                vh = document.documentElement.clientHeight;
                vstart = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                altitudes = map(posts, function (post) {
                    var rect = post.getBoundingClientRect();
                    return rect.bottom - vstart;
                });
                voffset = vh * settings.OFFSET;
                resolve();
            });
        })
        .then(findFirstInsertPosition)
        .then(insertSlots)
        .then(handleTruncatedSlots)
        .then(listenForScrolls);
    }

    function onUpdate(newPosts) {
        if (!newPosts || newPosts.length === 0) {
            return;
        }

        mediator.off('modules:autoupdate:updates', onUpdate);

        // We need to inject new ad slots if there is space for them. If yes,
        // then after the injection we just make sure firstPost is updated so
        // it won't break the process on the next update
        new Promise(function (resolve) {
            fastdom.read(function () {
                var pcur = bonzo(firstPost).previous();
                var pprev;

                posts = [pcur[0]];
                // Update first post if necessary
                if (posts.length % settings.INTERVAL === 0) {
                    firstPost = pcur[0];
                }

                while ((pprev = pcur.previous()) && pprev.length) {
                    posts.push(pprev[0]);
                    pcur = pprev;
                    // Update first post if necessary
                    if (posts.length % settings.INTERVAL === 0) {
                        firstPost = pcur[0];
                    }
                }

                // insertSlots expect a number of posts to be dropped from the
                // beginning. In this case, we must make sure the first n
                // (as per corresponding setting) are skipped.
                resolve(settings.INTERVAL - 1);
            });
        })
        .then(insertSlots)
        .then(listenForScrolls)
        .then(function () {
            mediator.on('modules:autoupdate:updates', onUpdate);
        });
    }

    function findFirstInsertPosition() {
        // Let's find the first post that ends below the viewport
        firstPostIndex = (function () {
            var i = 0;
            while (i < altitudes.length && altitudes[i] < vh) {
                i++;
            }
            return i === altitudes.length ? -1 : i;
        }());

        // If all the posts appear within the viewport then we don't load any ad
        if (firstPostIndex === -1) {
            throw firstPostIndex;
        }

        firstPost = posts[firstPostIndex];

        return firstPostIndex;
    }

    function insertSlots(firstPostIndex) {
        // Let's get every nth post after the first post, as per the corresponding setting
        function nth(_, index) {
            return index % settings.INTERVAL === 0;
        }

        posts = filter(drop(posts, firstPostIndex), nth);

        if (!posts.length) {
            throw 0;
        }

        // Insert ad slots after all the selected posts and keep track of the ones
        // sitting between truncated posts
        return new Promise(function (resolve) {
            fastdom.write(function () {
                var truncated = [];
                slots = map(posts, function (post) {
                    var $post = bonzo(post);
                    var $adSlot = bonzo(createAdSlot('inline1' + slotCounter++, 'liveblog-inline'));
                    if (truncated.length ||
                        $post.hasClass(truncatedClass) && $post.next().hasClass(truncatedClass)
                    ) {
                        truncated.push($adSlot);
                        $adSlot.addClass(truncatedClass);
                    }
                    $post.after($adSlot);
                    return $adSlot;
                }).concat(slots);

                mediator.emit('modules:liveblog:slots', slots);

                resolve(truncated);
            });
        });
    }

    function handleTruncatedSlots(truncated) {
        function truncation(onOrOff) {
            bean[onOrOff](document.body, 'click', '.article-elongator', removeTruncation);
            mediator[onOrOff]('module:liveblog:showkeyevents', removeTruncation);
            mediator[onOrOff]('module:filter:toggle', removeTruncation);
        }

        function removeTruncation() {
            forEach(truncated, function ($slot) {
                $slot.removeClass(truncatedClass);
            });
            truncated.length = 0;
            truncation('off');
        }

        if (truncated.length) {
            truncation('on');
        }
    }

    function listenForScrolls() {
        if (!listening) {
            if (onScrollDebounced === undefined) {
                onScrollDebounced = debounce(onScroll, settings.SCROLLTIMER);
            }
            mediator.on('window:throttledScroll', onScrollDebounced);
            listening = true;
        }
    }

    function onScroll() {
        // We need each ad slot current position relative to the viewport in
        // order to decide which ones are within range and then load them
        var rects = map(slots, function ($slot) {
            return $slot[0].getBoundingClientRect();
        });

        // We'll filter out all the slots who are displayed so that they
        // we don't repeat the whole process for them on the next scroll event
        slots = filter(slots, function ($slot, index) {
            if ($slot.hasClass('truncated-block')) {
                return true;
            }
            var rect = rects[index];
            if (-voffset < rect.bottom && rect.top < vh + voffset) {
                dfp.addSlot($slot);
                return false;
            }
            return true;
        });

        if (slots.length === 0) {
            mediator.off('window:throttledScroll', onScrollDebounced);
            listening = false;
        }
    }

    return {
        init: once(init),
        settings: settings
    };
});
