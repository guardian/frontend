/*
    Module: inline-link-card.js
    Description: Load in data from the linked page and display in sidebar
*/
define([
    'common',
    'modules/detect',
    'ajax',
    'bean',
    'bonzo'
], function (
    common,
    detect,
    ajax,
    bean,
    bonzo
) {

    function InlineLinkCard(link) {
        this.link = link;
        this.hasLoadedCard = false;
    }

    InlineLinkCard.prototype.init = function() {
        var self = this;

        self.loadCard();

        bean.on(window, 'resize', common.debounce(function(e){
            self.loadCard();
        }, 200));
    };

    InlineLinkCard.prototype.loadCard = function() {
        var layoutMode = detect.getLayoutMode();
        if(layoutMode.match('desktop|extended') && !this.hasLoadedCard) {
            this.fetchData();
        }
    };

    InlineLinkCard.prototype.fetchData = function() {
        var href = this.link.getAttribute('href'),
            self = this;

        // make request to endpoint
        ajax({
            url: href + '.json',
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                self.hasLoadedCard = true;

                var headline = resp.config.page.headline,
                    url = "/" + resp.config.page.pageId,
                    thumbnail = resp.config.page.thumbnail,
                    $template,
                    $templateHTML;

                $template = '<a href="' + url + '" class="card-wrapper">' +
                                '<div class="furniture furniture--left card">';
                                    if (thumbnail) { $template += '<img src="' + thumbnail + '" alt="" class="card__media" />'; }
                $template +=        '<div class="card__body"><h3 class="card__headline">' + headline + '</h3></div>' +
                                '</div>' +
                            '</a>';

                $templateHTML = document.createElement('div');
                $templateHTML.innerHTML = $template;
                document.querySelector('#preload-1 .article-body').insertBefore($templateHTML, self.link.parentNode);
            }, function(req) { }
        );
    };

    return InlineLinkCard;

});
