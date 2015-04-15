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
    'text!facia/views/liveblog-blocks.html',
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
    blocksTemplate,
    blockTemplate
) {
    var forgetAfterHours = 24,
        numDisplayedBlocks = 4,
        blockHeightPx = 42,

        animateDelayMs = 1000,
        refreshSecs = 60,
        refreshDecay = 2,
        refreshMaxTimes = 0,

        selector = '.js-liveblog-blocks',
        blocksClassName = 'fc-item__liveblog-blocks',
        newBlockClassName = 'fc-item__liveblog-block--new',
        oldBlockClassName = 'fc-item__liveblog-block--old',
        articleIdAttribute = 'data-article-id',
        storageKey = 'gu.liveblog.block-dates',

        veiwportHeightPx = detect.getViewport().height,
        elementsById = {};

    function renderBlock(articleId, block, index) {
        return template(blockTemplate, {
            classes: block.isNew ? newBlockClassName : oldBlockClassName,
            href: '/' + articleId + '#' + block.id,
            relativeTime: relativeDates.makeRelativeDate(new Date(block.publishedDateTime || null)),
            text: _.compact([block.title, block.body.slice(0, 200)]).join('. '),
            index: index + 1
        });
    }

    function cssTransformRules(offset) {
        return ('-webkit-transform: translate3d(0, -{{offset}}px, 0);' +
                    '-ms-transform: translate3d(0, -{{offset}}px, 0);' +
                        'transform: translate3d(0, -{{offset}}px, 0)').replace(/{{offset}}/g, offset || 0);
    }

    function renderBlocks(articleId, targets, blocks, oldBlockDate) {
        var fakeUpdate = _.isUndefined(oldBlockDate);

        fastdom.write(function () {
            _.forEach(targets, function (element) {
                var numNewBlocks = 0,

                    blocksHtml = _.chain(blocks)
                        .map(function (block, index) {
                            if (numNewBlocks < numDisplayedBlocks
                                && (block.publishedDateTime > oldBlockDate || (fakeUpdate && index === 0))) {
                                block.isNew = true;
                                numNewBlocks += 1;
                            }
                            return block;
                        })
                        .slice(0, numDisplayedBlocks + numNewBlocks)
                        .map(function (block, index) {
                            return renderBlock(articleId, block, index);
                        })
                        .value()
                        .join(''),

                    el = bonzo.create(
                        '<div class="fc-item__liveblog-blocks__inner u-faux-block-link__promote"' +
                            ' style="' + cssTransformRules(numNewBlocks * blockHeightPx) + '">' +
                            blocksHtml +
                        '</div>'
                    );
 
                bonzo(element).empty().addClass(blocksClassName).append(el);

                if (numNewBlocks && !maybeAnimateBlocks(el[0])) {
                    mediator.on('window:scroll', _.debounce(function() {
                        return maybeAnimateBlocks(el[0], true);
                    }, animateDelayMs));
                }
            });
        });
    }

    function maybeAnimateBlocks(el, immediate) {
        var vPosition = el.getBoundingClientRect().top;

        if (vPosition > blockHeightPx * -1 && vPosition < veiwportHeightPx - blockHeightPx) {
            setTimeout(function () {
                bonzo(el).attr('style', cssTransformRules(0));
            }, immediate ? 0 : animateDelayMs);
            return true;
        }
    }

    function sanitizeBlocks(blocks) {
        return _.filter(blocks, function (block) {
            return block.id && block.publishedDateTime && block.body && block.body.length >= 10;
        });
    }

    function pruneOldBlockDates(obj) {
        return _.omit(obj, function (date) {
            return !date || (new Date() - new Date(date)) / 3600000 > forgetAfterHours; // hours old
        });
    }

    function updateBlocks() {
        var oldBlockDates = storage.session.get(storageKey) || {};

        _.forEach(elementsById, function (elements, articleId) {
            ajax({
                url: '/' + articleId + '.json?rendered=false',
                type: 'json',
                crossOrigin: true
            })
            .then(function (response) {
                var blocks = response && sanitizeBlocks(response.blocks);

                if (blocks && blocks.length) {
                    renderBlocks(articleId, elements, blocks, oldBlockDates[articleId]);
                    oldBlockDates[articleId] = blocks[0].publishedDateTime;
                    storage.session.set(storageKey, pruneOldBlockDates(oldBlockDates));
                }
            });
        });

        if (refreshMaxTimes) {
            refreshMaxTimes -= 1;
            setTimeout(updateBlocks, refreshSecs * 1000);
            refreshSecs = refreshSecs * refreshDecay;
        }
    }

    function inject() {
        $(selector).each(function (element) {
            if (element.hasAttribute(articleIdAttribute)) {
                var articleId = element.getAttribute(articleIdAttribute);

                elementsById[articleId] = elementsById[articleId] || [];
                elementsById[articleId].push(element);
            }
        });

        if (!_.isEmpty(elementsById)) {
            updateBlocks();
        }
    }

    return inject;
});
