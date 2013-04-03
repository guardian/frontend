define(['modules/userPrefs', 'common', 'bonzo', 'bean', 'reqwest', 'qwery'], function (userPrefs, common, bonzo, bean, reqwest, qwery) {
	
	var hidden = true,
		closed = true,
		data = null,
		host = 'http://blackandwhite',
		url = host + '/pageview/dynamic/',
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
	
	function objectifyCookies(cookieString) {
		var cookies = {};
		cookieString.split(/\s*;\s*/).forEach(function(entry) {
			var cookieBits = entry.split('=');
			cookies[cookieBits[0]] = cookieBits[1] 
		});
		return cookies;
	}
	
	function displayInsight(insight) {
	    var sentence = insight.sentence;
	    if (insight.url) {
	        var $link = bonzo(document.createElement('a'));
	        $link.text(sentence);
	        if (insight.tooltip) {
	            $link.attr('title', insight.tooltip);
	        }
	        return $link[0].outerHTML;
	    } else {
	        return sentence;  
	    }
	}
	
	var sharedWisdomToolbar = {	
		// init takes callback, as makes http request
		init: function(callback) {
		    // only display if switched on
		    if (userPrefs.isOff(id)) {
		        return;
		    }
			var cookies = objectifyCookies(document.cookie),
				params = [
				    ['url', window.location], 
				    ['omniture_s_vi', cookies.s_vi || ''], 
				    ['ophan_browserId', cookies.OAX || '']
			    ];

			if (!data) {
			    // TODO: hacky, wait 5 secs for ads to appear - need a way of knowing ads have loaded
			    window.setTimeout(function() {
	                qwery('.ad-slot').forEach(function(adSlot) {
	                    // position of ad
	                    var ad = ['adslot_' + bonzo(adSlot).attr('data-base')],
	                        // get ad id (from the link, if it exists)
	                        a = common.$g('.ad-container  > a', adSlot),
	                        regEx = /(?:oas.guardian.co.uk|247realmedia.com).*\/Guardian\/([^/]+)/,
	                        campaignId;
	                    if (a.length !== 0 && (campaignId = regEx.exec(a.attr('href')))) {
	                        // pull out the campaign id
	                        ad.push(campaignId[1]); 
	                    } else {
	                        ad.push('__unknown__');
	                    }
	                    params.push(ad);
	                });
	                
	                reqwest({
	                    url: url + '?' + params.map(function(param) {
	                        return param[0] + '=' + encodeURIComponent(param[1])
	                    }).join('&'),
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
	                            ['Error getting data from ' + url + ': ' + resp.statusText, 'modules/shared-wisdom-toolbar.js', 101]
	                        );
	                    }
	                );
			    }, 5000)
			} else {
				callback();
			}
		},

    	show: function(config) {
    		if (hidden && !userPrefs.isOff(id + '.hidden')) {
	    		var numbersText = [];
	    		for (var text in data.numbers) {
	    			numbersText.push(text.replace(/_/g, ' ') + ': <strong>' + data.numbers[text] + '</strong>');
	    		}
	    		common.$g('body').prepend(
    				'<div id="shared-wisdom-toolbar" data-link-name="shared-wisdom-toolbar">' +
    					'<p class="top-insight">' + displayInsight(data.insights[0]) + '</p>' +
    					data.stats.map(function(stat) {
    						return '<abbr class="stat" title="' + stat.name + '">' + stat.value + '</abbr>'; 
    					}).join('') +
    					'<button data-link-name="open" type="button" class="toggle">▼</button>' +
    					'<button data-link-name="hide" type="button" class="hide">x</button>' +
    					'<div class="panel">' +
		    				'<ul>' +
		    					data.insights.slice(1).map(function(insight) {
		    						return '<li>' + displayInsight(insight) + '</li>'; 
		    					}).join('') +
		    				'</ul>' +
		    			'</div>' +
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
    		} else if (userPrefs.isOff(id + '.hidden')) {
    			sharedWisdomToolbar.button();
    		}
    	},
    
    	hide: function() {
    		if (!hidden) {
    			// remove on transition end
    			bean.on(common.$g('#shared-wisdom-toolbar')[0], 'transitionend webkitTransitionEnd', function() {
    				bonzo(this).remove();
        			hidden = true;
        			userPrefs.switchOff(id + '.hidden');
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
    			userPrefs.switchOn(id + '.hidden');
    			sharedWisdomToolbar.show();
    		})
    	},
    	
    	toggle: function() {
    		(closed) ? open() : close();
    	}
    };
	
	return sharedWisdomToolbar;

});
