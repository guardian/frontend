// @flow
import articleLiveblogCommon from 'bootstraps/enhanced/article-liveblog-common';
import trail from 'bootstraps/enhanced/trail';
import fullHeight from 'common/modules/ui/full-height';

const init = (): void => {
    articleLiveblogCommon();
    trail();
    fullHeight.init();
};

export { init };
