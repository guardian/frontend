define(['common', 'bonzo', 'bean', 'reqwest'], function (common, bonzo, bean, reqwest) {
	
	var hidden = true,
		closed = true,
		sharedWisdomToolbar = {

	    	show: function(config) {
	    		if (hidden) {
		    		common.$g('body').prepend(
	    				'<div id="shared-wisdom-toolbar" data-link-name="shared-wisdom-toolbar">' +
	    					'<p>Expensive page</p>' +
	    					'<button data-link-name="open" type="button" class="toggle">▼</button>' +
	    					'<button data-link-name="hide" type="button" class="hide">x</button>' +
	    				'</div>'
	    			);

		    		bean.on(common.$g('#shared-wisdom-toolbar .toggle')[0], 'click', function(e) {
		    			sharedWisdomToolbar.toggle();
		    		});
		    		bean.on(common.$g('#shared-wisdom-toolbar .hide')[0], 'click', function(e) {
		    			sharedWisdomToolbar.hide();
		    		});
		    		hidden = false;
	    		}
	    	},
	    
	    	hide: function() {
	    		if (!hidden) {
	    			// remove on transition end
	    			// NOTE - webkit specific
	    			bean.on(common.$g('#shared-wisdom-toolbar')[0], 'webkitTransitionEnd', function() {
	    				bonzo(this).remove();
	    			})
	    			common.$g('#shared-wisdom-toolbar').css('opacity', 0);
	    			hidden = true;
	    		}
	    	},
	    	
	    	toggle: function() {
	    		(closed) ? sharedWisdomToolbar.open() : sharedWisdomToolbar.close();
	    	},
	    	
	    	open: function() {
	    		// update button
	    		common.$g('#shared-wisdom-toolbar .toggle')
	    			.text('▲')
	    			.attr('data-link-name', 'close');
	    		common.$g('#shared-wisdom-toolbar').append(
	    			'<div class="panel">' +
	    				'<p>Something else</p>' +
	    			'<div>'
				);
    			closed = false;
	    		
	    	},
	    	
	    	close: function() {
	    		// update button
	    		common.$g('#shared-wisdom-toolbar .toggle')
	    			.text('▼')
	    			.attr('data-link-name', 'open');
	    		common.$g('#shared-wisdom-toolbar .panel').remove();
    			closed = true;
	    	}
	
	    };

    return sharedWisdomToolbar;

});
