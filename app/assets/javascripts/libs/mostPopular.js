define(["reqwest", guardian.js.modules.basicTemplate, guardian.js.modules.trailExpander], function(reqwest, basicTemplate, trailExpander) {
	reqwest({
        url: 'http://simple-navigation.appspot.com/most-popular/section/world?callback=?',
        type: 'jsonp',
        //jsonpCallback: 'callback',
        //jsonpCallbackName: 'showArticleComments',
        success: function(json) {
        	var html = '<div class="trailblock"><h3 class="b1">Popular right now</h3><ul class="plain">';
        	var trail = '<li><div class="media b1">{0}<div class="bd"><p><strong><a href="{1}">{2}</a></strong></p><p class="gt-base trailtext">{3}</p></div></div></li>';
        	var trailPic = '<a href="#" class="img"><img class="maxed" src="{0}" alt="{1}" /></a>';
        	for(var i in json) {
        		var article = json[i];
        		var img = '';
        		if (article.images.length > 0) {
        			var imageToUse = getBestImage(article.images);
        			var altText = imageToUse.caption + ' (' + imageToUse.credit + ')';
        			img = basicTemplate.format(trailPic, imageToUse.url, altText);
        		}
        		html += basicTemplate.format(trail, img, article.url, article.linkText, stripParagraphs(article.trailText));
        	}
        	html += '</ul><h3 class="b1 b1b expander"><a class="js-expand-trailblock" href="javascript://">More popular content</a> <span class="count">' + (parseInt(json.length) - 4) + '</span></h3></div>';

	       document.getElementById('tier3-1').innerHTML = html;
               trailExpander.bindExpanders();
        }
    });

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

});