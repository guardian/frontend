define(['common', 'ajax', 'bonzo', 'bean'], function (common, ajax, bonzo, bean) {

    return {

        nav: null,

        init: function (nav) {

            // if nav doesn't exist then this will change every <a> on the page...
            if (!nav) { return; }

            bonzo(nav).removeClass('js-not-ajax'); // removes the default left/right float style

            // update nav
            bonzo(common.$g('a', nav))
                .addClass('cta')
                .each(function(element, index) {
                    // update text in cta
                    var buttonText = element.getAttribute('data-js-title');
                    buttonText = (buttonText) ? buttonText : 'Show more matches';
                    bonzo(element).text(buttonText);
                });

            function clicked(_link) {
                var link = bonzo(_link);
                ajax({
                    url: link.attr('href'),
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'moreMatches',
                    success: function (response) {
                        // place html before nav
                        bonzo(nav).before(response.html);
                        // update more link (if there is more)
                        if (response.more) {
                            link.attr('href', response.more);
                        } else {
                            link.remove();
                        }
                    },
                    error: function () {
                        common.mediator.emit('module:error', 'Failed to load more matches', 'more-matches.js');
                    }
                });
            }
            
            common.mediator.on('ui:more-matches:clicked', clicked);

            bean.add(nav, 'a', 'click', function(e) {
                clicked(e.target);
                e.preventDefault();
            });

        }
    };

});