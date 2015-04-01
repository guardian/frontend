define([
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/storage',
    'bonzo',
    'common/modules/ui/relativedates',
    'common/utils/template',
    'text!facia/views/liveblog-latest-block.html'
], function (
    _,
    $,
    ajax,
    storage,
    bonzo,
    relativeDates,
    template,
    latestBlockTemplate
) {
    var maxDisplayedBlocks = 5,
        selector = '.js-live-blog-latest-blocks',
        articleIdAttribute = 'data-article-id',
        hiddenBlockClassname = 'fc-item__latest-block--hidden',
        seenBlockClassname = 'fc-item__latest-block--seen',
        storageKeyPreviousBlocks = 'gu.liveblog.updates',
        fakeResponse = {latestBlocks: [
            {
                blockId: '1',
                posted: new Date().getTime() - 300000,
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi'
            },
            {
                blockId: '2',
                posted: new Date().getTime() - 600000,
                body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta'
            },
            {
                blockId: '3',
                posted: new Date().getTime() - 900000,
                body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt'
            },
            {
                blockId: '4',
                posted: new Date().getTime() - 1200000,
                body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi'
            },
            {
                blockId: '5',
                posted: new Date().getTime() - 1500000,
                body: 'Perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta'
            },
            {
                blockId: '6',
                posted: new Date().getTime() - 1800000,
                body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt'
            },
            {
                blockId: '7',
                posted: new Date().getTime() - 2100000,
                body: 'Reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla Duis aute irure dolor in pariatur. Excepteur sint occaecat cupidatat non proident, sunt'
            }
        ]};

    function createUpdateHtml(block) {
        var posted = new Date(Number(block.posted));

        return template(latestBlockTemplate, {
            classes: block.classes,
            dateTimeString: posted.toISOString(),
            relativeTimeString: relativeDates.makeRelativeDate(block.posted),
            blockBody: block.body
        });
    }

    function renderBlocks(options) {
        var opts = _.pick(options, ['targets', 'blocks', 'blocksAlreadyRendered', 'markAsRead', 'fakeUpdate']),
            omitBlockIds = _.pluck(opts.blocksAlreadyRendered, 'blockId');

        _.forEach(opts.targets, function (element) {
            _.chain(opts.blocks)
                .slice(0, maxDisplayedBlocks)
                .filter(function (block) {
                    return !_.contains(omitBlockIds, block.blockId);
                })
                .forEachRight(function (block, index) {
                    var classes = [];

                    if (opts.markAsRead || (opts.fakeUpdate && index > 0)) {
                        classes.push(seenBlockClassname);
                    }

                    if (opts.blocksAlreadyRendered || (opts.fakeUpdate && index === 0)) {
                        classes.push(hiddenBlockClassname);
                    }

                    block.classes = classes.join(' ');
                    bonzo(element).prepend(createUpdateHtml(block)).attr('data-blockId', block.blockId);
                })
                .value();

            if (opts.blocksAlreadyRendered || opts.fakeUpdate) {
                setTimeout(function () {
                    $('.' + hiddenBlockClassname, element).removeClass(hiddenBlockClassname);
                }, 1000);
            }
        });
    }

    function sanitizeBlocks(blocks) {
        return _.reduce(blocks, function (blocks, block) {
            return (blocks || []).concat({
                blockId: block.blockId,
                posted: block.posted,
                body: block.body
            });
        }, null);
    }

    function updateLatestBlocks(elementsById) {
        var persistedBlocksById = storage.session.get(storageKeyPreviousBlocks) || {},
            persistableBlocksById = {};

        _.forEach(elementsById, function (elements, articleId) {
            var persistedBlocks = persistedBlocksById[articleId];

            if (persistedBlocks) {
                renderBlocks({
                    targets: elements,
                    blocks: persistedBlocks,
                    markAsRead: true
                });
            }

            ajax({
                url: '/' + articleId + '/live-blog-blocks.json',
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function (response) {
                    var latestBlocks;

                    // TEMP:
                    response = fakeResponse;

                    latestBlocks = response && sanitizeBlocks(response.latestBlocks);

                    if (latestBlocks) {
                        renderBlocks({
                            targets: elements,
                            blocks: latestBlocks,
                            blocksAlreadyRendered: persistedBlocks,
                            fakeUpdate: !persistedBlocks
                        });

                        // TEMP:
                        persistableBlocksById[articleId] = latestBlocks.slice(2);
                        //persistableBlocksById[articleId] = latestBlocks;

                        storage.session.set(storageKeyPreviousBlocks, persistableBlocksById);
                    }
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
            updateLatestBlocks(elementsById);
        }
    }

    return start;
});
