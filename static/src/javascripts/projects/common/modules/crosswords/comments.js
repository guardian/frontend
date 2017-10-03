// @flow
import config from 'lib/config';
import { DiscussionLoader } from 'common/modules/discussion/loader';
import qwery from 'qwery';

function initCrosswordDiscussion() {
    if (config.switches.enableDiscussionSwitch && config.page.commentable) {
        var el = qwery('.discussion')[0];
        if (el) {
            new DiscussionLoader.Loader().attachTo(el);
        }
    }
}

export { initCrosswordDiscussion };
