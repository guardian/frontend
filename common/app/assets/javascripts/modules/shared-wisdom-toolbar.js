define(['modules/userPrefs', 'common', 'bonzo', 'bean', 'reqwest'], function (userPrefs, common, bonzo, bean, reqwest) {
	
	var hidden = true,
		closed = true,
		data = null,
		url = 'http://10.121.73.229/api/1.0/pageview/testme/',
		panelHeight = null,
		id = 'shared-wisdom-toolbar';

	function open() {
		// update button
		common.$g('#shared-wisdom-toolbar .toggle')
			.text('▲')
			.attr('data-link-name', 'close');
		common.$g('#shared-wisdom-toolbar .panel').css('height', panelHeight + 'px');
		closed = false;
		
	}
	
	function close() {
		// update button
		common.$g('#shared-wisdom-toolbar .toggle')
			.text('▼')
			.attr('data-link-name', 'open');
		common.$g('#shared-wisdom-toolbar .panel').css('height', 0);
		closed = true;
	}
	
	function objectifyCookie(cookieString) {
		var cookie = {};
		cookieString.split(/\s*;\s*/).forEach(function(entry) {
			var cookieBits = entry.split('=');
			cookie[cookieBits[0]] = cookieBits[1] 
		});
		return cookie;
	}
	
	var sharedWisdomToolbar = {	
		// init takes callback, as makes http request
		init: function(callback) {
			var cookie = objectifyCookie(document.cookie);
			if (!data) {;
				reqwest({
					url: url + '?url=' + encodeURIComponent(window.location.pathname),
					type: 'json',
					method: 'get',
					crossOrigin: true
				})
				.then(
					function(respData) {
						data = respData;
						callback();
					},
					function(resp) {
						common.mediator.trigger(
							'module:error', 
							['Error getting data from ' + url + ': ' + resp.statusText, 'modules/shared-wisdom-toolbar.js', x]
						);
					}
				);
			} else {
				callback();
			}
		},

    	show: function(config) {
    		if (hidden && !userPrefs.isOff(id)) {
	    		var numbersText = [];
	    		for (var text in data.numbers) {
	    			numbersText.push(text.replace(/_/g, ' ') + ': <strong>' + data.numbers[text] + '</strong>');
	    		}
	    		common.$g('body').prepend(
    				'<div id="shared-wisdom-toolbar" data-link-name="shared-wisdom-toolbar">' +
    					'<p>' + data.top_insight_sentence + '</p>' +
    					'<button data-link-name="open" type="button" class="toggle">▼</button>' +
    					'<button data-link-name="hide" type="button" class="hide">x</button>' +
    					'<div class="panel">' +
		    				'<p>' + numbersText.join(' and ') + '</p>' +
		    				'<ul>' +
		    					data.other_insights.map(function(insight) {
		    						return '<li>' + insight + '</li>'; 
		    					}).join('') +
		    				'<ul>' +
		    			'<div>' +
    				'</div>'
    			);
	    		var panel = common.$g('body #shared-wisdom-toolbar .panel');
	    		// get the height of the panel, for expanding transition
	    		panelHeight = panel.dim().height;
	    		panel.css({'height': 0, 'display': 'block'});
	    		common.$g('body #shared-wisdom-toolbar').css('opacity', 1);

	    		bean.on(common.$g('#shared-wisdom-toolbar')[0], 'click', '.toggle', function(e) {
	    			sharedWisdomToolbar.toggle();
	    		});
	    		bean.on(common.$g('#shared-wisdom-toolbar')[0], 'click', ' .hide', function(e) {
	    			sharedWisdomToolbar.hide();
	    		});
	    		hidden = false;
    		} else if (userPrefs.isOff(id)) {
    			sharedWisdomToolbar.button();
    		}
    	},
    
    	hide: function() {
    		if (!hidden) {
    			// remove on transition end
    			// NOTE - webkit specific
    			bean.on(common.$g('#shared-wisdom-toolbar')[0], 'webkitTransitionEnd', function() {
    				bonzo(this).remove();
        			hidden = true;
        			userPrefs.switchOff(id);
    				sharedWisdomToolbar.button();
    			})
    			common.$g('#shared-wisdom-toolbar').css('opacity', 0);
    		}
    	},
    	
    	button: function() {
    		common.$g('body').prepend(
				'<button id="show-shared-wisdom-toolbar" data-link-name="show" type="button" class="show">O</button>'
			);
    		bean.on(common.$g('#show-shared-wisdom-toolbar')[0], 'click', function() {
    			bonzo(this).remove();
    			userPrefs.switchOn(id);
    			sharedWisdomToolbar.show();
    		})
    	},
    	
    	toggle: function() {
    		(closed) ? open() : close();
    	}
    };
	
	return sharedWisdomToolbar;

});
