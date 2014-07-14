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

        window.console.log(matchers);

        return ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                var html = '';

                resp.collections.forEach(function(coll) {
                    if (matchers.indexOf(coll.displayName) > -1) {
                       coll.content.forEach(function(article) {
                           html += '<div><a href="/' + article.id + '">' + article.headline + '</a></div>';   
                       });
                    }
                });
               
                html = '<div class="gs-container breaking-news">' + html + '</div>';
                bonzo(document.querySelector('#header')).after(html);
            },
            function() {
                mediator.emit(
                    'module:error', 'Failed to load breaking news'
                );  
            }
        );
    };

});
