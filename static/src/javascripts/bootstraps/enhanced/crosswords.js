define([
    'common/modules/crosswords/main',
    'common/modules/crosswords/comments',
    'common/modules/crosswords/series'
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
