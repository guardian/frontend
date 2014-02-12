define([
    'qwery',
    'bonzo',
    'common/modules/experiments/truncator'
], function (
    qwery,
    bonzo,
    Truncator
) {

    function switchComments(config) {
        if(config.page.commentable && qwery('.js-comments').length) {
            bonzo(qwery('.related')).insertBefore(qwery('.js-comments'));
        }
        bonzo(qwery('.article__keywords')).hide();
    }

    var ArticleTruncationTest = function () {

        this.id = 'ArticleTruncation';
        this.expiry = '2014-02-28';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.description = 'Test the effectiveness of truncating articles to increase onward journey CTR';
        this.canRun = function (config) {
            return config.page.contentType === 'Article' && !config.page.isLiveBlog;
        };
        this.variants = [
            {
                id: 'control',
                test: function (context, config) {
                    switchComments(config);
                    return true;
                }
            },
            {
                id: 'three',
                test: function (context, config) {
                    switchComments(config);
                    var t = new Truncator({
                        wordCap: 300,
                        wordCount: config.page.wordCount
                    });
                }
            },
            {
                id: 'four',
                test: function (context, config) {
                    switchComments(config);
                    var t = new Truncator({
                        wordCap: 400,
                        wordCount: config.page.wordCount
                    });
                }
            },
            {
                id: 'five',
                test: function (context, config) {
                    switchComments(config);
                    var t = new Truncator({
                        wordCap: 500,
                        wordCount: config.page.wordCount
                    });
                }
            }

        ];
    };

    return ArticleTruncationTest;
});