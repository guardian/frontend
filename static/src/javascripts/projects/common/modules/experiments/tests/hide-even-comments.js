define([
    'common/utils/$',
    'common/utils/config',
    'common/modules/experiments/tests/utils/comment-blocker',
    'lodash/collections/some'
    ], function (
    $,
    config,
    CommentBlocker,
    some
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
        'australia-news/series/politics-live-with-katharine-murphy'
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
        var contains = some(values, function(value){
            return value === toTest;
        });
        return !contains;
    }

    return function () {

            this.id = 'HideEvenComments';
            this.start = '2016-05-15';
            this.expiry = '2016-06-06';
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
                return testAuthor !== dontRunOnAuthor && canRunOnBlog && canRunOnSeries;
            };

            this.isContent = !/Network Front|Section|Tag/.test(config.page.contentType);

            this.variants = [
                {
                    id: 'hide-comments',
                    test: function(){
                        var isContent = !/Network Front|Section|Tag/.test(config.page.contentType),
                            shortUrlSlug = (config.page.shortUrl || '').replace('http://gu.com', ''),
                            hide = CommentBlocker.hideComments(shortUrlSlug);

                        if(isContent && hide) {
                            $('.js-comments').addClass('discussion--hidden');
                            $('.js-commentcount').addClass('commentcount2--hidden');
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

