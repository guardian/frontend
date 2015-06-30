define([
    'bonzo',
    'fastdom',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/storage',
    'common/modules/ui/relativedates',
    'common/utils/template',
    'common/utils/mediator',
    'common/utils/detect',
    'text!facia/views/liveblog-block.html'
], function (
    bonzo,
    fastdom,
    _,
    $,
    ajax,
    storage,
    relativeDates,
    template,
    mediator,
    detect,
    blockTemplate
) {
    var pxBeforeAnimate = 100,
        animateDelayMs = 2000,
        refreshSecs = 30,
        refreshDecay = 1,
        refreshMaxTimes = 5,

        selector = '.js-snappable .js-liveblog-blocks',
        blocksClassName = 'fc-item__liveblog-blocks',
        articleIdAttribute = 'data-article-id',
        sessionStorageKey = 'gu.liveblog.block-dates',
        prefixedTransforms = ['-webkit-transform', '-ms-transform', 'transform'],

        veiwportHeightPx = detect.getViewport().height,
        elementsById = {};

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
            text: _.compact([block.title, block.body.slice(0, 500)]).join('. '),
            index: index + 1
        });
    }

    function showBlocks(articleId, targets, blocks, oldBlockDate) {
        var fakeUpdate = _.isUndefined(oldBlockDate);

        fastdom.write(function () {
            _.forEach(targets, function (element) {
                var hasNewBlock = false,
                    wrapperClasses = [
                        'fc-item__liveblog-blocks__inner',
                        'u-faux-block-link__promote'
                    ],
                    blocksHtml = _.chain(blocks)
                        .slice(0, 2)
                        .map(function (block, index) {
                            if (!hasNewBlock && (block.publishedDateTime > oldBlockDate || fakeUpdate)) {
                                block.isNew = true;
                                hasNewBlock = true;
                                wrapperClasses.push('fc-item__liveblog-blocks__inner--offset');
                            }
                            return renderBlock(articleId, block, index);
                        })
                        .slice(0, hasNewBlock ? 2 : 1)
                        .value(),

                    el = bonzo.create(
                        '<div class="' + wrapperClasses.join(' ') + '">' + blocksHtml.join('') + '</div>'
                    );

                bonzo(element).addClass(blocksClassName).append(el);

                if (hasNewBlock) {
                    animateBlocks(el[0]);
                }
            });
        });
    }

    function animateBlocks(el) {
        if (!maybeAnimateBlocks(el)) {
            mediator.on('window:scroll', _.debounce(function () {
                return maybeAnimateBlocks(el, true);
            }, animateDelayMs));
        }
    }

    function maybeAnimateBlocks(el, immediate) {
        var vPosition = el.getBoundingClientRect().top;

        if (vPosition > pxBeforeAnimate * -1 && vPosition < veiwportHeightPx - pxBeforeAnimate) {
            setTimeout(function () {
                bonzo(el).removeClass('fc-item__liveblog-blocks__inner--offset');
            }, immediate ? 0 : animateDelayMs);
            return true; // remove listener
        }
    }

    function sanitizeBlocks(blocks) {
        return _.filter(blocks, function (block) {
            return block.id && block.publishedDateTime && block.body && block.body.length >= 10;
        });
    }

    function show() {
        var oldBlockDates;

        $(selector).each(function (element) {
            if (element.hasAttribute(articleIdAttribute)) {
                var articleId = element.getAttribute(articleIdAttribute);

                elementsById[articleId] = elementsById[articleId] || [];
                elementsById[articleId].push(element);
            }
        });

        if (!_.isEmpty(elementsById)) {
            oldBlockDates = storage.session.get(sessionStorageKey) || {};

            _.forEach(elementsById, function (elements, articleId) {
                ajax({
                    url: '/' + articleId + '.json?rendered=false',
                    type: 'json',
                    crossOrigin: true
                })
                .then(function (response) {
                    var blocks = response && sanitizeBlocks(response.blocks);

                    if (blocks && blocks.length) {
                        showBlocks(articleId, elements, blocks, oldBlockDates[articleId]);
                        oldBlockDates[articleId] = blocks[0].publishedDateTime;
                        storage.session.set(sessionStorageKey, oldBlockDates);
                    }
                });
            });

            if (refreshMaxTimes) {
                refreshMaxTimes -= 1;
                setTimeout(function () {
                    show();
                }, refreshSecs * 1000);
                refreshSecs = refreshSecs * refreshDecay;
            }
        }
    }

    return {
        show:  show
    };
});
