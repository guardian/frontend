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
                id: 'twenty',
                test: function (context, config) {
                    switchComments(config);
                    var t = new Truncator({
                        percentageCap: 20,
                        wordCount: config.page.wordCount
                    });
                }
            },
            {
                id: 'thirty',
                test: function (context, config) {
                    switchComments(config);
                    var t = new Truncator({
                        percentageCap: 30,
                        wordCount: config.page.wordCount
                    });
                }
            },
            {
                id: 'forty',
                test: function (context, config) {
                    switchComments(config);
                    var t = new Truncator({
                        percentageCap: 40,
                        wordCount: config.page.wordCount
                    });
                }
            }

        ];
    };

    return ArticleTruncationTest;
});