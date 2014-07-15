define([
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/onward/history',
    'bonzo'
], function (
    $,
    mediator,
    ajax,
    History,
    bonzo
) {
    var breakignNewsSource = '/breaking-news/lite.json',
        historyThreshold = 2,
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
        
            matchers[window.location.pathname.slice(1)] = true;

            if (page.edition) {
                matchers[page.edition.toLowerCase()] = true;
                editionSection.push(page.edition.toLowerCase());
            }

            if (page.section) {
                matchers[page.section.toLowerCase()] = true;
                editionSection.push(page.section.toLowerCase());
            }
           
            matchers[editionSection.join('/')] = true;
            
            if (page.keywordIds) {
                page.keywordIds.split(',').forEach(function(keyword) {
                    matchers[keyword.toLowerCase()] = true;
                    matchers[keyword.split('/')[0].toLowerCase()] = true;
                }); 
            }

            hist = new History();
            hist.get().forEach(function(article) {
                var s = article.section;

                histCount[s] = (histCount[s] || 0) + 1;

                if (histCount[s] >= historyThreshold) {
                    matchers[s] = true;
                } 
            });

            window.console.log('Breaking news matchers: ' + Object.keys(matchers).join(', '));
        }

        ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                var articles = [];

                resp.collections.forEach(function(coll) {
                    var collName = coll.displayName.toLowerCase();

                    if (coll.content.length && (collName === 'global' || matchers[collName])) {
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
