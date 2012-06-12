define([
    "reqwest",
    guardian.js.modules.basicTemplate,
    "bonzo"],
    function(reqwest, basicTemplate, bonzo) {

    	function init(url, customOptions) {

	    	var options = {
	            mode: 'flat', // can be 'flat', 'nestedMultiple', 'nestedSingle'
	            isShaded: false,
	            header: '',
	            elm: document.getElementById('tier3-1'),
	            limit: 3, // number of items to show by default
	            allowExpanding: true,
	            showSubHeadings: false
	        };

	        // override defaults
	        for (var attrname in customOptions) { 
	            options[attrname] = customOptions[attrname]; 
	        }

	        // go and fetch content
	        getTrails(url); 
	    	
	    	function getTrails(url) {
	    		reqwest({
	                url: url,
	                type: 'jsonp',
	                success: function(json) {
	                    processTrails(json);
	                }
	            });
	    	}

	    	function wrapTrails(trails, id) {
	    		var html = '<div class="trailblock component';
	            if (options.isShaded) { html += ' trailblock-shaded';}
	            html += '" id="' + id + '">' + trails + '</div>';
	            return html;
	    	}

	    	function addToDom(html, toBind) {
	    		options.elm.innerHTML = html;
	            bonzo(options.elm).removeClass('placeholder');
	            options.elm.setAttribute("data-link-name", "most popular"); // todo: make dynamic
	            
	            if (options.allowExpanding) {

		            // bind the expander(s)
		            // have to look up elms here as they don't exist until now
		            if (typeof(toBind) === "object") {
		            	var elms = [];
		            	for (var i=0, l=toBind.length; i<l; i++) {
		            		elms[i] = document.getElementById(toBind[i]);
		            	}
		            } else {
		            	var elms = document.getElementById(toBind);
		           	}
		        	
		        	guardian.js.ee.emit('addExpander', elms);
		        }
	    	}

	    	function addExpanderLink(total, visible) {
	    		var count = total - visible;
	    		return '<h3 class="b1 b1b expander"><a class="js-expand-trailblock" href="javascript://">Show more</a> <span class="count">' + count + '</span></h3>';
	    	}

	    	// todo: come up with better IDs than foo2 etc
	    	function processTrails(json) {

	    		var html = '';
	    		var toBind;

	    		if (options.header) {
	    			html += '<h3>' + options.header + '</h3>';
	    		}

	            if (options.mode == 'flat') {
	                var trails = buildTrails(json);
	                toBind = 'foo';
	                
	                // append expander if articles.length > limit
                    if (json.length > options.limit && options.allowExpanding) {
                    	trails += addExpanderLink(json.length, options.limit)
                    }
	                html += wrapTrails(trails, 'foo');
					
	            } else if (options.mode == 'nestedSingle') {

	            	var trails = '';
	            	var list = {};
	            	
	            	var i = 0;
					for (var section in json) {
	                    var articles = json[section];
	                    list[i] = articles[0]; // feels hacky
	                    i++;
	                }

					trails += buildTrails(list);
	        		toBind = 'foo2';

	        		// append expander if articles.length > limit
	        		// todo: why doesn't list.length work (undefined) instead of i?
                    if (i > options.limit && options.allowExpanding) {
                    	trails += addExpanderLink(i, options.limit)
                    }

	        		html += wrapTrails(trails, 'foo2');

	            } else if (options.mode == 'nestedMultiple') {

	                var count = 0;
	                toBind = [];

					for (var section in json) {
	                    var articles = json[section];
	                    var trails = buildTrails(articles);
	                    var id = 'foo-' + count;
	            		toBind[count] = id; // add binder to array
	                    count++;

	                    // append expander if articles.length > limit
	                    if (articles.length > options.limit && options.allowExpanding) {
	                    	trails += addExpanderLink(articles.length, options.limit)
	                    }

	            		html += wrapTrails(trails, id);
	                }

	            }

	            // add the HTML
	            addToDom(html, toBind);

	    	}

			function buildTrails(articles) {

	            // set up templates
	            var trail = '<li><div class="media b1">{0}<div class="bd">{1}<p><strong><a href="{2}">{3}</a></strong></p><p class="gt-base trailtext">{4}</p></div></div></li>';

	            var trailPic = '<a href="{0}" class="img"><img class="maxed" src="{1}" alt="{2}" /></a>';

	            var html = '';
				
				if (articles.length && articles[0].sectionName) {
                	header = articles[0].sectionName;
                	html += '<h3>' + header + '</h3>';
            	}
	            
	            html += '<ul class="plain show-' + options.limit + '">';


	            for(var i in articles) {

	                var article = articles[i];
	                var img = '';

	                // todo: strip HTML from captions
	                if (article.images && article.images.length > 0) {
	                    var imageToUse = getBestImage(article.images);
	                    var altText = imageToUse.caption + ' (' + imageToUse.credit + ')';
	                    img = basicTemplate.format(trailPic, article.url, imageToUse.url, altText);
	                }

	                var subHeading = ''; 

	                // takes first tag, fairly dumb
	                if (options.showSubHeadings && article.tags) {
	                	subHeading = '<h5>' + article.tags[0].name + '</h5>';
	                }

	                html += basicTemplate.format(trail, img, subHeading, article.url, article.linkText, stripParagraphs(article.trailText));
	            }

	            html += '</ul>';

	            return html;
	        }

	        // this is really dumb at the moment
	        // trail text comes back with <p> tags around it,
	        // which break when we wrap them in other <p> tags
	        function stripParagraphs(text) {
	            var str = text.replace('<p>', '');
	            return str.replace('</p>', '');
	        }

	        function getBestImage(images) {
	            if (!images.length) { return false; }
	            var idealWidth = 300;
	            var bestWidthSoFar = 0;
	            var idealImage = images[0]; // assume first if only 1

	            for (var i in images) {
	                var img = images[i];
	                if (img.width > bestWidthSoFar) {
	                    idealImage = img;
	                }
	                bestWidthSoFar = img.width;
	            }

	            return idealImage;
	        }

	    }

        return {
            fetchContent: init
        }

    }
);