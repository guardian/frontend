define([
    'bonzo',
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
        maxDisplayedBlocks = 5,
        blockHeightPx = 44,
        selector = '.js-liveblog-blocks',
        newBlockClassname = 'fc-item__liveblog-block--new',
        oldBlockClassname = 'fc-item__liveblog-block--old',
        articleIdAttribute = 'data-article-id',
        storageKey = 'gu.liveblog.block-dates';

    function renderBlock(block) {
        return template(blockTemplate, {
            classes: block.isNew ? newBlockClassname : oldBlockClassname,
            relativeTime: relativeDates.makeRelativeDate(new Date(block.publishedDateTime || null)),
            title: block.title || '',
            body: block.body.slice(0, 100)
        });
    }

    function renderBlocks(targets, blocks, lastDateTime) {
        var fakeUpdate = _.isUndefined(lastDateTime);

        _.forEach(targets, function (element) {
            var el,
                numNewBlocks = 0,
                blocksHtml = _.chain(blocks)
                    .slice(0, maxDisplayedBlocks)
                    .map(function (block, index) {
                        if (block.publishedDateTime > lastDateTime || (fakeUpdate && index === 0)) {
                            block.isNew = true;
                            numNewBlocks += 1;
                        }
                        return renderBlock(block);
                    })
                    .value()
                    .join('');

            if (blocksHtml) {
                el = bonzo.create(template(blocksTemplate, {
                    newBlocksHeight: numNewBlocks * blockHeightPx,
                    blocksHtml: blocksHtml
                }));

                bonzo(element).prepend(el);

                if (numNewBlocks) {
                    setTimeout(function () {
                        bonzo(el).removeAttr('style');
                    }, 1000);
                }
            }
        });
    }

    function sanitizeBlocks(blocks) {
        return _.filter(blocks, function (block) {
            return block.id && block.publishedDateTime && block.body && block.body.length >= 10;
        });
    }

    function pruneOldBlockDates(obj) {
        return _.omit(obj, function (date) {
            return (new Date() - new Date(date)) / 3600000 > forgetAfterHours; // hours old
        });
    }

    function updateBlocks(elementsById) {
        var oldBlockDates = storage.session.get(storageKey) || {};

        _.forEach(elementsById, function (elements, articleId) {
            ajax({
                url: '/' + articleId + '.json?rendered=false',
                type: 'json',
                crossOrigin: true
            })
            .then(function (response) {
                var blocks = response && sanitizeBlocks(response.blocks);

                if (blocks.length) {
                    renderBlocks(elements, blocks, oldBlockDates[articleId]);
                    oldBlockDates[articleId] = blocks[0].publishedDateTime;
                    storage.session.set(storageKey, pruneOldBlockDates(oldBlockDates));
                }
            });
        });
    }

    function start() {
        var elementsById = {};

        $(selector).each(function (element) {
            if (element.hasAttribute(articleIdAttribute)) {
                var articleId = element.getAttribute(articleIdAttribute);

                elementsById[articleId] = elementsById[articleId] || [];
                elementsById[articleId].push(element);
            }
        });

        if (!_.isEmpty(elementsById)) {
            updateBlocks(elementsById);
        }
    }

    return start;
});
