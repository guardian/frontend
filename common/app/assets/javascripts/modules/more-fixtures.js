define(['common', 'reqwest', 'bonzo', 'qwery'], function(common, reqwest, bonzo, qwery) {
	
	return {
		nav: null,
		
		init: function(nav) {
			
			this.nav = nav;
			
			// update nav
			bonzo(qwery('a', nav))
				.text('Show next 3 days')
				.addClass('cta');
			
			common.mediator.on('ui:more-fixtures:clicked', function(link) {
				var link = bonzo(link);
				var callbackName = 'loadMoreFixtures';
				reqwest(
					{
						url: link.attr('href') + '?callback=?',
	                    type: 'jsonp',
	                    success: function (response) {
	                    	// place html before nav
	                    	bonzo(nav).before(response.html)
	                    	// update more link (if there is more)
	                    	if (response.more) {
	                    		link.attr('href', response.more)
	                    	}
	                    }
                    }
				);
			})
		}
	}
	
})