define([
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/onward/history',
    'lodash/objects/assign',
    'lodash/arrays/flatten',
    'bonzo'
], function (
    $,
    mediator,
    ajax,
    history,
    _assign,
    _flatten,
    bonzo
) {
    var breakignNewsSource = '/breaking-news/lite.json',
        threshold = 2,
        maxDisplayed = 1,
        header;

    function slashDelimit() {
        return Array.prototype.slice.call(arguments).filter(function(str) { return str;}).join('/');
    }

    return function (config) {
        var page = (config || {}).page,
            keyword = page.keywordIds ? (page.keywordIds + '').split(',')[0] : '',
            matchers;

        if (!page) { return; }

        matchers = [
            page.edition,
            page.section,
            slashDelimit(page.edition, page.section),
            window.location.pathname.slice(1),
            keyword,
            keyword.split('/')[0]
        ]
        .filter(function(match) { return match; })
        .reduce(function(matchers, str) {
            matchers[str.toLowerCase()] = threshold;
            return matchers;
        }, {});

        _assign(matchers, history.getSummary().sections);
        _assign(matchers, history.getSummary().keywords);

        ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                _flatten(
                    resp.collections
                    .filter(function(collection) {
                        return (collection.content.length && (collection.href === 'global' || matchers[collection.href] >= threshold))
                    })
                    .map(function(collection) {
                        return collection.content;
                    })
                )
                .slice(0, maxDisplayed)
                .forEach(function(article) {
                    header = header || bonzo(document.querySelector('#header'));
                    header.after('<div id="breaking-news" class="gs-container"><a href="/' + article.id + '">' + article.headline + '</a></div>');
                });
            },
            function() {
                mediator.emit(
                    'module:error', 'Failed to load breaking news'
                );  
            }
        );
    };

});
