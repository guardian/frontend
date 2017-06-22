define(['common/modules/atoms/youtube'], function(youtube) {
    function init() {
        youtube.checkElemsForVideos();
    }

    return {
        init: init,
    };
});
