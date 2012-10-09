define(['common', 'reqwest', 'bonzo', 'qwery'], function (common, reqwest, bonzo, qwery) {

    return {
        nav:null,

        init:function (nav) {

            this.nav = nav;

            // update nav
            bonzo(qwery('a', nav))
                .addClass('cta')
                .each(function(element, index) {
                	var element = bonzo(element);
                	// update text in cta
                	element.text('Show ' + bonzo(element).attr('data-link-name') + ' 3 days');
                });

            common.mediator.on('ui:more-fixtures:clicked', function (_link) {
                var link = bonzo(_link);
                var callbackName = 'loadMoreFixtures';
                reqwest(
                    {
                        url:link.attr('href') + '?callback=?',
                        type:'jsonp',
                        success:function (response) {
                            // place html before nav
                            bonzo(nav).before(response.html);
                            // update more link (if there is more)
                            if (response.more) {
                                link.attr('href', response.more);
                            }
                        }
                    }
                );
            });
        }
    };
});