define([
    'bonzo',
    'common/modules/ui/relativedates',
    'lib/$',
    'lib/chain',
    'lib/detect',
    'lib/fastdom-promise',
    'lib/fetch-json',
    'lib/mediator',
    'lib/storage',
    'lodash/utilities/template',
    'raw-loader!facia/views/liveblog-block.html',
    'lodash/arrays/compact',
    'lodash/objects/isUndefined',
    'lodash/collections/forEach',
    'lodash/functions/debounce',
    'lodash/collections/filter',
    'lodash/objects/isEmpty',
    'lodash/collections/map'
], function (
    bonzo,
    relativeDates,
    $,
    chain,
    detect,
    fastdomPromise,
    fetchJson,
    mediator,
    storage,
    template,
    blockTemplate,
    compact,
    isUndefined,
    forEach,
    debounce,
    filter,
    isEmpty,
    map
) {
    var animateDelayMs = 2000,
        animateAfterScrollDelayMs = 500,
        refreshSecs = 30,
        refreshDecay = 1,
        refreshMaxTimes = 5,

        selector = '.js-liveblog-blocks',
        articleIdAttribute = 'data-article-id',
        sessionStorageKey = 'gu.liveblog.block-dates',

        veiwportHeightPx = detect.getViewport().height;

    function blockRelativeTime(block) {
        var pubDate = (block || {}).publishedDateTime,
            relDate = pubDate ? relativeDates.makeRelativeDate(new Date(pubDate)) : false;

        return relDate || '';
    }

    function renderBlock(articleId, block, index) {
        var relTime = blockRelativeTime(block);

        if (relTime.match(/yesterday/i)) {
            relTime = relTime.toLowerCase();
        } else if (relTime) {
            relTime = 'Latest update ' + relTime + ' ago';
        } else {
            relTime = 'Updated just now';
        }

        return template(blockTemplate, {
            ariaHidden: !block.isNew,
            href: '/' + articleId + '#' + block.id,
            relativeTime: relTime,
            text: compact([block.title, block.body.slice(0, 500)]).join('. '),
            index: index + 1
        });
    }

    function showBlocks(articleId, targets, blocks, oldBlockDate) {
        var fakeUpdate = isUndefined(oldBlockDate);

        forEach(targets, function (element) {
            var hasNewBlock = false,
                wrapperClasses = [
                    'fc-item__liveblog-blocks__inner',
                    'u-faux-block-link__promote'
                ],
                blocksHtml = chain(blocks).slice(0, 2).and(map, function (block, index) {
                        if (!hasNewBlock && (block.publishedDateTime > oldBlockDate || fakeUpdate)) {
                            block.isNew = true;
                            hasNewBlock = true;
                            wrapperClasses.push('fc-item__liveblog-blocks__inner--offset');
                        }
                        return renderBlock(articleId, block, index);
                    }).slice(0, hasNewBlock ? 2 : 1).value(),

                el = bonzo.create(
                    '<div class="' + wrapperClasses.join(' ') + '">' + blocksHtml.join('') + '</div>'
                ),
                $element = bonzo(element);

            fastdomPromise.write(function () {
                $element.append(el);
            })
            .then(function () {
                if (hasNewBlock) {
                    animateBlocks(el[0]);
                }
            });
        });
    }

    function animateBlocks(el) {
        maybeAnimateBlocks(el)
        .then(function (didAnimate) {
            var animateOnScroll;

            if (!didAnimate) {
                animateOnScroll = debounce(function () {
                    maybeAnimateBlocks(el, true).then(function (didAnimate) {
                        if (didAnimate) {
                            mediator.off('window:throttledScroll', animateOnScroll);
                        }
                    });
                }, animateAfterScrollDelayMs);

                mediator.on('window:throttledScroll', animateOnScroll);
            }
        });
    }

    function maybeAnimateBlocks(el, immediate) {
        return fastdomPromise.read(function () {
            return el.getBoundingClientRect().top;
        })
        .then(function (vPosition) {
            if (vPosition > 0 && vPosition < veiwportHeightPx) {
                setTimeout(function () {
                    var $el = bonzo(el);

                    fastdomPromise.write(function () {
                        $el.removeClass('fc-item__liveblog-blocks__inner--offset');
                    });
                }, immediate ? 0 : animateDelayMs);
                return true;
            }
        });
    }

    function sanitizeBlocks(blocks) {
        return filter(blocks, function (block) {
            return block.id && block.publishedDateTime && block.body && block.body.length >= 10;
        });
    }

    function show() {
        return fastdomPromise.read(function () {
            var elementsById = {};

            $(selector).each(function (element) {
                var articleId = element.getAttribute(articleIdAttribute);

                if (articleId) {
                    elementsById[articleId] = elementsById[articleId] || [];
                    elementsById[articleId].push(element);
                }
            });
            return elementsById;
        })
        .then(function (elementsById) {
            var oldBlockDates;

            if (!isEmpty(elementsById)) {
                oldBlockDates = storage.session.get(sessionStorageKey) || {};

                forEach(elementsById, function (elements, articleId) {
                    fetchJson('/' + articleId + '.json?rendered=false', {
                        mode: 'cors'
                    })
                    .then(function (response) {
                        var blocks = response && sanitizeBlocks(response.blocks);

                        if (blocks && blocks.length) {
                            showBlocks(articleId, elements, blocks, oldBlockDates[articleId]);
                            oldBlockDates[articleId] = blocks[0].publishedDateTime;
                            storage.session.set(sessionStorageKey, oldBlockDates);
                        }
                    })
                    .catch(function () {});
                });

                if (refreshMaxTimes) {
                    refreshMaxTimes -= 1;
                    setTimeout(function () {
                        show();
                    }, refreshSecs * 1000);
                    refreshSecs = refreshSecs * refreshDecay;
                }
            }

        });
    }

    return {
        show:  show
    };
});
