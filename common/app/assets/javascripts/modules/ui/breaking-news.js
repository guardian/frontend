define([
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'bonzo'
], function (
    $,
    mediator,
    ajax,
    bonzo
) {
    var breakignNewsSource = '/breaking-news/lite.json';

    return function (config) {
        var matchers = [window.location.pathname.slice(1)],
            edSec = [];

        if (!config || !config.page) {
            return;
        }

        if (config.page.edition) {
            matchers.push(config.page.edition.toLowerCase());
            edSec.push(config.page.edition.toLowerCase());
        }

        if (config.page.section) {
            matchers.push(config.page.section.toLowerCase());
            edSec.push(config.page.section.toLowerCase());
        }
        
        edSec = edSec.join('/');
        matchers.push(edSec);

        return ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                var articles = [];

                resp.collections.forEach(function(coll) {
                    if (coll.content.length && (matchers.indexOf(coll.displayName) > -1 || coll.displayName === 'global')) {
                       articles = articles.concat(coll.content);
                    }
                });

                if (articles.length) {
                   bonzo(document.querySelector('#header')).after(
                       '<div class="gs-container breaking-news">' +
                       articles.map(function(article) {return '<a href="/' + article.id + '">' + article.headline + '</a>';}).join('') + 
                       '</div>'
                   );
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
