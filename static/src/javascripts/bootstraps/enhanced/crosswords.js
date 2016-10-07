define([
    'projects/common/modules/crosswords/main',
    'projects/common/modules/crosswords/comments',
    'projects/common/modules/crosswords/series'
], function (
    init,
    initComments,
    initSeries
) {
    return {
        init: function () {
            init();
            initComments();
            initSeries();
        }
    };
});
