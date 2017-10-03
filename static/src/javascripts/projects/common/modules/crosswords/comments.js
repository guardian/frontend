// @flow
import config from 'lib/config';
import { Loader } from 'common/modules/discussion/loader';
import qwery from 'qwery';

function initCrosswordDiscussion() {
    if (config.switches.enableDiscussionSwitch && config.page.commentable) {
        var el = qwery('.discussion')[0];
        if (el) {
            new Loader().attachTo(el);
        }
    }
}

export { initCrosswordDiscussion };
