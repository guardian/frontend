define([
    'comment-count',
    'Promise',
    'common/utils/assign',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/utils/fetch',
    'common/utils/formatters',
    'common/utils/mediator',
    'common/utils/report-error'
], function (
    commentCountWidget,
    Promise,
    assign,
    config,
    fastdom,
    fetch,
    formatters,
    mediator,
    reportError
) {
    function remove (node) {
        // Comment count widgets are inside a <a> tag
        const container = node.parentNode;
        return fastdom.write(function () {
            // because Node.remove() doesn't exist on IE
            container.parentNode.removeChild(container);
        });
    }

    function init(overrideConfig) {
        var base = config.page.ajaxUrl || '';
        var widgetConfig = assign({
            apiBase: base + '/discussion/comment-counts.json',
            apiQuery: 'shortUrls',
            onupdate: function (node, count) {
                if (count === 0 && node.hasAttribute('closed')) {
                    return remove(node);
                }
            },
            format: formatters.integerCommas,
            fetch: fetch,
            Promise: Promise
        }, overrideConfig);

        //Load new counts when more trails are loaded
        mediator.on('modules:related:loaded', function () {
            commentCountWidget.update(widgetConfig)
            .then(function () {
                mediator.emit('modules:commentcount:loaded');
            })
            .catch(report);
        });

        return commentCountWidget.load(widgetConfig)
        .then(function () {
            mediator.emit('modules:commentcount:loaded');
        })
        .catch(report);
    }

    function report (error) {
        reportError(error, {
            feature: 'comment-count'
        }, false);
    }

    return {
        init: init
    };
});
