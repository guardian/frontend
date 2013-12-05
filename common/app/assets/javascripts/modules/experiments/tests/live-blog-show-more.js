define([
    'modules/experiments/live-blog-show-more'
], function (
    ShowMore
) {

    var LiveBlogShowMore = function () {

        this.id = 'LiveBlogShowMore';
        this.expiry = '2013-10-30';
        this.audience = 0.2;
        this.audienceOffset = 0;
        this.description = 'Show only 10 live blog blocks at a time with a cta to show more';
        this.canRun = function(config) {
            return config.page.isLiveBlog;
        };
        this.variants = [
            {
                id: 'control',
                test: function () {
                    return true;
                }
            },
            {
                id: 'live-blog-show-more',
                test: function (context) {
                    var showMore = new ShowMore({
                        context: context
                    });
                }
            }
        ];
    };

    return LiveBlogShowMore;

});
