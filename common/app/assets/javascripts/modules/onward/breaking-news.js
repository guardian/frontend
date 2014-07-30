define([
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/onward/history',
    'lodash/objects/assign',
    'bonzo'
], function (
    $,
    mediator,
    ajax,
    History,
    assign,
    bonzo
) {
    var breakignNewsSource = '/breaking-news/lite.json',
        threshold = 2,
        header,
        matchers,
        editionSection,
        hist,
        histCount;

    return function (config) {
        var page = (config || {}).page;

        if (!page) { return; }

        if (!matchers) {
            matchers = {};
            editionSection = [];
            histCount = {};
        
            matchers[window.location.pathname.slice(1)] = threshold;

            if (page.edition) {
                matchers[page.edition.toLowerCase()] = threshold;
                editionSection.push(page.edition.toLowerCase());
            }

            if (page.section) {
                matchers[page.section.toLowerCase()] = threshold;
                editionSection.push(page.section.toLowerCase());
            }
           
            matchers[editionSection.join('/')] = threshold;
            
            if (page.keywordIds) {
                page.keywordIds.split(',').forEach(function(keyword) {
                    matchers[keyword.toLowerCase()] = threshold;
                    matchers[keyword.split('/')[0].toLowerCase()] = threshold;
                }); 
            }

            hist = new History();
            assign(matchers, hist.getSummary().sections);
            assign(matchers, hist.getSummary().keywords);
        }

        ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                var articles = [];

                resp.collections.forEach(function(coll) {
                    var href = coll.href.toLowerCase().trim();

                    if (coll.content.length && (href === 'global' || matchers[href] >= threshold)) {
                       articles = articles.concat(coll.content);
                    }
                });

                $('#breaking-news').remove();

                header = header || bonzo(document.querySelector('#header'));
                
                if (articles.length) {
                     header.after('<div id="breaking-news" class="gs-container"><a href="/' + articles[0].id + '">' + articles[0].headline + '</a></div>');
                }
            },
            function() {
                mediator.emit(
                    'module:error', 'Failed to load breaking news'
                );  
            }
        );
    };

});
