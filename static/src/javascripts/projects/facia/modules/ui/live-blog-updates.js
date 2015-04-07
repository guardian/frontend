define([
    'bonzo',
    'fastdom',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/storage',
    'common/modules/ui/relativedates',
    'common/utils/template',
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
    blocksTemplate,
    blockTemplate
) {
    var forgetAfterHours = 24,
        numDisplayedBlocks = 4,
        blockHeightPx = 44,

        refreshSecs = 30,
        refreshDecay = 2,
        refreshMaxTimes = 10,

        selector = '.js-liveblog-blocks',
        newBlockClassname = 'fc-item__liveblog-block--new',
        oldBlockClassname = 'fc-item__liveblog-block--old',
        articleIdAttribute = 'data-article-id',
        storageKey = 'gu.liveblog.block-dates',

        elementsById = {};

    function renderBlock(articleId, block, index) {
        return template(blockTemplate, {
            classes: block.isNew ? newBlockClassname : oldBlockClassname,
            href: '/' + articleId + '#' + block.id,
            relativeTime: relativeDates.makeRelativeDate(new Date(block.publishedDateTime || null)),
            text: _.compact([block.title, block.body.slice(0, 200)]).join('. '),
            index: index + 1
        });
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

                    el = bonzo.create(template(blocksTemplate, {
                        newBlocksHeight: numNewBlocks * blockHeightPx,
                        blocksHtml: blocksHtml
                    }));

                bonzo(element).empty().prepend(el);

                if (numNewBlocks) {
                    setTimeout(function () {
                        bonzo(el).removeAttr('style');
                    }, 1000);
                }
            });            
        });
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

    function start() {
        fastdom.read(function () {
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
        });
    }

    return start;
});
