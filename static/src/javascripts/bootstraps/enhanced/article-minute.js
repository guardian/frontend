import articleLiveblogCommon from 'bootstraps/enhanced/article-liveblog-common';
import trail from 'bootstraps/enhanced/trail';
import fullHeight from 'common/modules/ui/full-height';
var ready = function() {
    articleLiveblogCommon();
    trail();
    fullHeight.init();
};

export default {
    init: ready
};
