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
                        var linksToCardify = context.querySelectorAll('.article-body > p a[href^="/"]');
                        common.$g('body').addClass('test-link-card--on');

                        function cardifyRelatedInBodyLink(link) {
                            new InlineLinkCard(link, link.parentNode, 'Related').init();
                        }
                        function isArticle(url) {
                            return (/\/[0-9]{4}\/[a-z]{3}\/[0-9]{2}\//).test(url);
                        }

                        if (linksToCardify.length > 0) {

                            if (linksToCardify.length === 1) {
                                // There's only one link
                                cardifyRelatedInBodyLink(linksToCardify[0]);
                            } else {
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
                                    linksInParagraph = articleParagraphs[i].querySelectorAll('a[href^="/"]');
                                    numberOfLinksInParagraph = linksInParagraph.length;
                                    j = 0;
                                    linkWasCardified = false;

                                    if (numberOfLinksInParagraph > 0) {
                                        while (j < numberOfLinksInParagraph) {
                                            if (isArticle(linksInParagraph[j].href)) {
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
                        }
                    });
                }
            }
        ];
    };

    return ExperimentInlineLinkCard;

});
