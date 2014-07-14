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
    var breakignNewsSource = '/breaking-news/lite.json',
        header = bonzo(document.querySelector('#header'));

    return function (config) {
        var matchers = [window.location.pathname.slice(1)],
            page = (config || {}).page,
            editionSection = [];

        if (!page) { return; }

        if (page.edition) {
            matchers.push(page.edition.toLowerCase());
            editionSection.push(page.edition.toLowerCase());
        }

        if (page.section) {
            matchers.push(page.section.toLowerCase());
            editionSection.push(page.section.toLowerCase());
        }
       
        if (page.keywordIds) {
            page.keywordIds.split(',').forEach(function(keyword) {
                matchers.push(keyword.toLowerCase());
                matchers.push(keyword.split('/')[0].toLowerCase());
            }); 
        }

        matchers.push(editionSection.join('/'));
        window.console.log(matchers);

        return ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                var articles = [];

                resp.collections.forEach(function(coll) {
                    if (coll.content.length && (matchers.indexOf(coll.displayName.toLowerCase()) > -1 || coll.displayName.toLowerCase() === 'global')) {
                       articles = articles.concat(coll.content);
                    }
                });

                $('#breaking-news').remove();

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
