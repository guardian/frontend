define([
    'common/modules/video/youtube'
], function (
    youtube
) {

    function init() {
        youtube.checkElemsForVideos();
    }

    return {
        init: init
    };
});
