define([
    "reqwest",
    guardian.js.modules.basicTemplate,
    guardian.js.modules.trailExpander],
    function(reqwest, basicTemplate, trailExpander) {

        String.prototype.toSentenceCase = function () {
            return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };

        function buildTrails(articles, limit, header, isShaded) {

            var html = '<div class="trailblock show-' + limit;
            if (isShaded) {
                html += ' trailblock-shaded';
            }
            html += '"><h3>' + header + '</h3><ul class="plain">';

            var trail = '<li><div class="media b1">{0}<div class="bd"><p><strong><a href="{1}">{2}</a></strong></p><p class="gt-base trailtext">{3}</p></div></div></li>';
            var trailPic = '<a href="{0}" class="img"><img class="maxed" src="{1}" alt="{2}" /></a>';

            for(var i in articles) {
                var article = articles[i];
                var img = '';

                if (article.images.length > 0) {
                    var imageToUse = getBestImage(article.images);
                    var altText = imageToUse.caption + ' (' + imageToUse.credit + ')';
                    img = basicTemplate.format(trailPic, article.url, imageToUse.url, altText);
                }

                html += basicTemplate.format(trail, img, article.url, article.linkText, stripParagraphs(article.trailText));
            }

            html += '</ul>';

            if(articles.length > limit) {
                html += '<h3 class="b1 b1b expander"><a class="js-expand-trailblock" href="javascript://">More popular content</a> <span class="count">' + (parseInt(articles.length) - limit) + '</span></h3>';
            }
            html += '</div>';

            return html;
        }


        // construct our HTML
        function buildHTML(json, header, isNested, isShaded, limit) {

            if (!json) {
                return;
            }

            var html = '';

            if (isNested) { // we have multiple categories

                for (var section in json) {
                    var articles = json[section];
                    html += buildTrails(articles, limit, section.toSentenceCase(), isShaded);
                }

            } else { // it's just a flat list
                html = buildTrails(json, limit, header, isShaded);
            }

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

        function makeContentRequest(url, options) {

            var defaults = {
                isNested: false,
                isShaded: false,
                header: '',
                elm: document.getElementById('tier3-1'),
                limit: 3 // number of items to show by default
            };

            // override defaults
            for (var attrname in options) { 
                defaults[attrname] = options[attrname]; 
            }

            // this looks confusing. just renaming the var
            // so it looks clearer
            options = defaults;

            reqwest({
                url: url,
                type: 'jsonp',
                success: function(json) {
                    var html = buildHTML(json, options.header, options.isNested, options.isShaded, options.limit);
                    options.elm.innerHTML = html;
                    options.elm.className = '';
                    options.elm.setAttribute("data-link-name", "most popular"); // todo: make dynamic name
                    guardian.js.ee.emit('addExpander', options.elm);
                }
            });
        }

        return {
            fetchContent: makeContentRequest
        }

    }
);