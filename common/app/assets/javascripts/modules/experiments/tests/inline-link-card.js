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

    var ExperimentInlineLinkCard = function () {

        this.id = 'InlineLinkCard';
        this.expiry = '2013-08-21';
        this.audience = 1;
        this.description = 'Impact of cardifying inline links on number of linked stories read';
        this.canRun = function(config) {
            var layoutMode = detect.getLayoutMode();
            return config.page.contentType === 'Article' && layoutMode === 'extended';
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                   return true;
                }
            },
            {
                id: 'link-card',
                test: function () {
                    common.mediator.on('page:article:ready', function(config, context) {
                        var linksToCardify = context.querySelectorAll('.article-body > p a[href]');
                        common.$g('body').addClass('test-link-card--on');

                        function isArticle(url) {
                            return (/\/[\w-]+\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w-]+/).test(url);
                        }
                        function isVideo(url) {
                        return (/\/[\w-]+\/video\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w-]+|youtube\.com|dailymotion\.com|vimeo\.com/).test(url);
                        }
                        function isGallery(url) {
                            return (/\/[\w-]+\/gallery\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w-]+/).test(url);
                        }
                        function isCif(url) {
                            return (/\/commentisfree\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\/[\w-]+/).test(url);
                        }
                        function isWikipedia(url) {
                            return (/^http:\/\/en\.wikipedia\.org\/wiki\/[\w-\.]+$/).test(url);
                        }
                        function isWhiteListed(url) {
                            return isCif(url) || isGallery(url) || isVideo(url) || isArticle(url) || isWikipedia(url);
                        }

                        function cardifyRelatedInBodyLink(link) {
                            var title = 'Related';

                            if (isVideo(link.href)) { title = 'Video'; }
                            else if (isGallery(link.href)) { title = 'Gallery'; }
                            else if (isCif(link.href)) { title = 'Comment'; }

                            new InlineLinkCard(link, link.parentNode, title).init();
                        }

                        if (linksToCardify.length > 0) {
                            // There are multiple links
                            var articleParagraphs = context.querySelectorAll('.article-body > p'),
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
                                        console.log(isWhiteListed(linksInParagraph[j].href), linksInParagraph[j].href);
                                        if (isWhiteListed(linksInParagraph[j].href)) {
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
                    });
                }
            }
        ];
    };

    return ExperimentInlineLinkCard;

});
