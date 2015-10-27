define([
    'projects/common/modules/crosswords/main',
    'projects/common/modules/crosswords/thumbnails',
    'projects/common/modules/crosswords/comments',
    'projects/common/modules/crosswords/series'
], function (
    init,
    thumbnails,
    initComments,
    initSeries
) {
    return {
        init: function () {
            init();
            thumbnails.init();
            initComments();
            initSeries();
        }
    }
})
