define(
    [
        'bootstraps/enhanced/article-liveblog-common',
        'bootstraps/enhanced/trail',
        'common/modules/ui/full-height',
    ],
    function(articleLiveblogCommon, trail, fullHeight) {
        var ready = function() {
            articleLiveblogCommon();
            trail();
            fullHeight.init();
        };

        return {
            init: ready,
        };
    }
);
