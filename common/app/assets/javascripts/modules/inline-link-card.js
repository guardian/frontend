/*
    Module: inline-link-card.js
    Description: Load in data from the linked page and display in sidebar
*/
define([
    'common',
    'ajax',
    'bean',
    'bonzo'
], function (
    common,
    ajax,
    bean,
    bonzo
) {

    function InlineLinkCard(link, options) {
        var opts = options || {};

        // initialise
        this.init = function() {
            var href = link.getAttribute('href');
            // make request to endpoint
            ajax({
                url: href + '.json',
                type: 'json',
                crossOrigin: true
            }).then(
                function(resp) {
                    // console.log(resp);
                    // console.log(bonzo(bonzo.create(resp.html))[1]);

                    // bonzo($p.previous()).before(linkToCardify.parent());
                }, function(req) { }
            );

        };
    }

    return InlineLinkCard;

});