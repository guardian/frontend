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
        this.type = this.options.type;

        if (typeof this.options.supportedTypes[this.type] !== 'undefined') {
            this.loadCard();
        }
    }

    LeftHandCard.prototype.DEFAULTS = {
        context: document,
        supportedTypes: {
            'internal': true,
            'external': true
        }
    };

    LeftHandCard.prototype.loadCard = function() {
        var self = this;
        var linksToCardify = self.options.context.querySelectorAll('.article-body > p a[href]');
        common.$g('body').addClass('test-link-card--on');

        function isArticle(url) {
            return (/^\/[\w\-]+\/(?:[\w\-]+\/)?[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isVideo(url) {
            if (self.options.type === 'external') {
                return (/\/[\w\-]+\/video\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+|youtube\.com|dailymotion\.com|vimeo\.com/).test(url);
            }
            return (/\/[\w\-]+\/video\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isGallery(url) {
            return (/\/[\w\-]+\/gallery\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isCif(url) {
            return (/\/commentisfree\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w\-]+/).test(url);
        }
        function isWikipedia(url) {
            return (/^http:\/\/en\.wikipedia\.org\/wiki\/[\w\-\.]+$/).test(url);
        }
        function isBBC(url) {
            return (/^http:\/\/(?:(?:www|m)\.)?bbc\.co\.uk/).test(url);
        }
        function isWhiteListed(url) {
            if (self.options.type === 'external') {
                return isCif(url) || isGallery(url) || isVideo(url) || isArticle(url) || isWikipedia(url) || isBBC(url);
            }
            return isCif(url) || isGallery(url) || isVideo(url) || isArticle(url);
        }

        function cardifyRelatedInBodyLink(link) {
            var title = 'Related';

            if (isVideo(link.getAttribute('href').trim())) { title = 'Video'; }
            else if (isGallery(link.getAttribute('href').trim())) { title = 'Gallery'; }
            else if (isCif(link.getAttribute('href').trim())) { title = 'Comment'; }
            else if (isWikipedia(link.getAttribute('href').trim())) { title = 'Wikipedia'; }

            new InlineLinkCard(link, link.parentNode, title).init();
        }

        if (linksToCardify.length > 0) {
            // There are multiple links
            var articleParagraphs = self.options.context.querySelectorAll('.article-body > p'),
                numberOfArticleParagraphs = articleParagraphs.length,
                insertCardEveryNParagraphs = 4,
                lastParagraphsToNotCardify = 3, // Always allow enough space to display a card
                linksInParagraph,
                numberOfLinksInParagraph,
                i = 0,
                j,
                linkWasCardified;

            // Looking for links every insertCardEveryNParagraphs paragraphs
            while (i < (numberOfArticleParagraphs - lastParagraphsToNotCardify)) {
                linksInParagraph = articleParagraphs[i].querySelectorAll('a[href]');
                numberOfLinksInParagraph = linksInParagraph.length;
                j = 0;
                linkWasCardified = false;

                if (numberOfLinksInParagraph > 0) {
                    while (j < numberOfLinksInParagraph) {
                        if (isWhiteListed(linksInParagraph[j].getAttribute('href').trim())) {
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
