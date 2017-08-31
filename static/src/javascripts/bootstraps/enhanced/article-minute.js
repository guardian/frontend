// @flow
import { init as initLiveblogCommon } from 'bootstraps/enhanced/article-liveblog-common';
import { initTrails } from 'bootstraps/enhanced/trail';
import fullHeight from 'common/modules/ui/full-height';

const init = (): void => {
    initLiveblogCommon();
    initTrails();
    fullHeight.init();
};

export { init };
