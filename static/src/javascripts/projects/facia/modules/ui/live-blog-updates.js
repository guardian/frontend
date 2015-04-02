define([
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/storage',
    'bonzo',
    'common/modules/ui/relativedates',
    'common/utils/template',
    'text!facia/views/liveblog-latest-blocks.html',
    'text!facia/views/liveblog-latest-block.html'
], function (
    _,
    $,
    ajax,
    storage,
    bonzo,
    relativeDates,
    template,
    latestBlocksTemplate,
    latestBlockTemplate
) {
    var forgetAfterHours = 24,
        maxDisplayedBlocks = 5,
        blockHeightPx = 44,
        selectorClassname = '.js-live-blog-latest-blocks',
        newBlockClassname = 'fc-item__latest-block--new',
        oldBlockClassname = 'fc-item__latest-block--old',
        articleIdAttribute = 'data-article-id',
        storageKeyPreviousBlocks = 'gu.liveblog.updates';

    function createUpdateHtml(block) {
        return template(latestBlockTemplate, {
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
                    .sortBy('publishedDateTime')
                    .reverse()
                    .map(function (block, index) {
                        if (block.publishedDateTime > lastDateTime || (fakeUpdate && index === 0)) {
                            block.isNew = true;
                            numNewBlocks += 1;
                        }
                        return createUpdateHtml(block);
                    })
                    .value()
                    .join('');

            if (blocksHtml) {
                el = bonzo.create(template(latestBlocksTemplate, {
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

    function updateLatestBlocks(elementsById) {
        var oldBlockDates = storage.session.get(storageKeyPreviousBlocks) || {};

        _.forEach(elementsById, function (elements, articleId) {
            ajax({
                url: '/' + articleId + '.json?rendered=false',
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function (response) {
                    var blocks = response && sanitizeBlocks(response.blocks);

                    if (blocks.length) {
                        renderBlocks(elements, blocks, oldBlockDates[articleId]);

                        oldBlockDates = _.omit(oldBlockDates, function (lastDate) {
                            return (new Date() - new Date(lastDate)) / 3600000 > forgetAfterHours; // hours old
                        });
                        oldBlockDates[articleId] = blocks[0].publishedDateTime;
                        storage.session.set(storageKeyPreviousBlocks, oldBlockDates);
                    }
                }
            });
        });
    }

    function start() {
        var elementsById = {};

        $(selectorClassname).each(function (element) {
            if (element.hasAttribute(articleIdAttribute)) {
                var articleId = element.getAttribute(articleIdAttribute);

                elementsById[articleId] = elementsById[articleId] || [];
                elementsById[articleId].push(element);
            }
        });

        if (!_.isEmpty(elementsById)) {
            updateLatestBlocks(elementsById);
        }
    }

    return start;
});
