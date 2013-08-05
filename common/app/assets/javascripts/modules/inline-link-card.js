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
                // console.log(resp);
                // console.log(bonzo(bonzo.create(resp.html))[1]);

                // bonzo($p.previous()).before(linkToCardify.parent());
            }, function(req) { }
        );
    };

    return InlineLinkCard;

});
