define([
    'common',
    'modules/detect',
    'modules/experiments/inline-link-card'
],
function (
    common,
    detect,
    InlineLinkCard
) {

    function LeftHandCard(options) {
        this.options = common.extend(this.DEFAULTS, options);
        this.origin = this.options.origin;

        if (typeof this.options.supportedOrigins[this.origin] !== 'undefined') {
            this.loadCard();
        }
    }

    LeftHandCard.prototype.DEFAULTS = {
        context: document,
        linksHolders: '.article-body > p',
        supportedOrigins: {
            'internal': true,
            'all': true
        }
    };

    LeftHandCard.prototype.loadCard = function() {
        var self = this,
            linksToCardify = self.options.context.querySelectorAll(self.options.linksHolders + ' a[href]');

        common.$g('body').addClass('test-link-card--on');

        function stripHost(url) {
            return url.replace("http://" + document.location.host, "");
        }

        function isArticle(url) {
            return (/^\/[\w\-]+\/(?:[\w\-]+\/)?[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isVideo(url) {
            return (/\/[\w\-]+\/video\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isExternalVideo(url) {
            return (/youtube\.com|dailymotion\.com|vimeo\.com/).test(url);
        }
        function isGallery(url) {
            return (/\/[\w\-]+\/gallery\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isCif(url) {
            return (/\/commentisfree\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isWikipedia(url) {
            return (/^http:\/\/en\.wikipedia\.org\/wiki\/[\w\-\.\(\)\,]+$/).test(url);
        }
        function isBBC(url) {
            return (/^http:\/\/(?:(?:www|m)\.)?bbc\.co\.uk/).test(url);
        }
        function isWhiteListed(url, origin) {
            if (origin === 'all') {
                return isCif(url) || isGallery(url) || isVideo(url) || isExternalVideo(url) || isArticle(url) || isWikipedia(url) || isBBC(url);
            }
            return isCif(url) || isGallery(url) || isVideo(url) || isArticle(url);
        }

        function cardifyRelatedInBodyLink(link) {

            var href = stripHost(link.getAttribute('href')),
                types = {
                    'Related':       { test: isArticle,       title: "Related" },
                    'BBC':           { test: isBBC,           title: "Related" },
                    'Video':         { test: isVideo,         title: "Video" },
                    'ExternalVideo': { test: isExternalVideo, title: "Video" },
                    'Gallery':       { test: isGallery,       title: "Gallery" },
                    'Comment':       { test: isCif,           title: "Comment" },
                    'Wikipedia':     { test: isWikipedia,     title: "Wikipedia" }
                };

            Object.keys(types).some(function(type) {
                if (types[type].test(href)) {
                    new InlineLinkCard(link, link.parentNode, types[type].title).init();
                    return true;
                }
            });
        }

        if (linksToCardify.length > 0) {
            // There are multiple links
            var articleParagraphs = self.options.context.querySelectorAll(self.options.linksHolders),
                numberOfArticleParagraphs = articleParagraphs.length,
                insertCardEveryNParagraphs = 4,
                lastParagraphsToNotCardify = 3, // Always allow enough space to display a card
                linksInParagraph,
                numberOfLinksInParagraph,
                i = 0,
                j,
                linkWasCardified,
                normalisedHref,
                hrefPath;

            // Looking for links every insertCardEveryNParagraphs paragraphs
            while (i < (numberOfArticleParagraphs - lastParagraphsToNotCardify)) {
                linksInParagraph = articleParagraphs[i].querySelectorAll('a[href]');
                numberOfLinksInParagraph = linksInParagraph.length;
                j = 0;
                linkWasCardified = false;

                if (numberOfLinksInParagraph > 0) {
                    while (j < numberOfLinksInParagraph) {
                        normalisedHref = stripHost(linksInParagraph[j].getAttribute('href'));
                        hrefPath = new RegExp(normalisedHref.split("?")[0].split("#")[0]);
                        if (
                            isWhiteListed(normalisedHref, self.options.origin)
                            && !(hrefPath).test(window.location) // No link to self
                            ) {
                            cardifyRelatedInBodyLink(linksInParagraph[j]);
                            linkWasCardified = true;

                            break;
                        }
                        j++;
                    }
                }
                if (linkWasCardified) {
                    i = i + insertCardEveryNParagraphs;
                } else {
                    i++;
                }
            }
        }
    };

    return LeftHandCard;

});
