define([
    'qwery',
    'common/utils/config',
    'common/modules/experiments/tests/utils/comment-blocker',
    'common/modules/identity/api'
], function (
    qwery,
    config,
    CommentBlocker,
    identity
) {
    var seriesIds = [
        'fashion/series/sali-hughes-beauty',
        'politics/series/politics-live-with-andrew-sparrow',
        'books/series/tips-links-and-suggestions-books',
        'music/series/readersrecommend',
        'technology/series/chatterbox',
        'sport/series/county-cricket-live-blog',
        'sport/series/talking-horses',
        'books/series/poemoftheweek',
        'football/series/you-are-the-ref',
        'lifeandstyle/series/how-to-eat',
        'commentisfree/series/you-tell-us',
        'football/series/footballweekly',
        'australia-news/series/politics-live-with-katharine-murphy',
        'crosswords/series/quick',
        'crosswords/series/quiptic',
        'crosswords/series/cryptic,',
        'crosswords/series/speedy'
    ];

    var blogIds = [
        'lifeandstyle/the-running-blog',
        'crosswords/crossword-blog',
        'politics/blog',
        'environment/bike-blog',
        'technology/askjack',
        'commentisfree/series/guardian-comment-cartoon'
    ];

    var dontRunOnAuthor = 'First Dog on the Moon';

    function doesNotContain(values, toTest) {
        return values.indexOf(toTest) === -1;
    }

    return function () {

            this.id = 'ParticipationDiscussionTest';
            this.start = '2016-05-26';
            this.expiry = '2016-07-25';
            this.author = 'Nathaniel Bennett';
            this.description = 'Hide comments for a percentage of users to determine what effect it has on their dwell time and loyalty ';
            this.audience = 0.1;
            this.audienceOffset = 0.5;
            this.successMeasure = 'We want to guage how valuable comments actually are to us';
            this.audienceCriteria = 'All users';
            this.dataLinkNames = '';
            this.idealOutcome = 'DO we want to turn comments up or down';

            this.canRun = function () {
                var testAuthor = config.page.author || '';
                var canRunOnBlog = doesNotContain(blogIds, config.page.blogIds || '');
                var canRunOnSeries = doesNotContain(seriesIds, config.page.seriesId || '');
                var notLoggedIn = !identity.isUserLoggedIn();
                return testAuthor !== dontRunOnAuthor && canRunOnBlog && canRunOnSeries && notLoggedIn;
            };

            this.variants = [
                {
                    id: 'variant-1',
                    test: function(){
                        var shortUrlSlug = (config.page.shortUrl || '').replace('http://gu.com/p/', ''),
                            hide = CommentBlocker.hideComments(shortUrlSlug);

                        if(config.page.isContent && hide) {
                            qwery('.js-comments').forEach(function(c) {
                                c.classList.add('discussion--hidden');
                            });
                            qwery('.js-commentcount').forEach(function(c) {
                                c.classList.add('commentcount2--hidden');
                            });
                        }
                    }
                },
                {
                    id: 'control',
                    test: function(){}
                }
            ];
        };
    }
);
