// @flow
import config from 'lib/config';
import { Loader } from 'common/modules/discussion/loader';
import qwery from 'qwery';

const initCrosswordDiscussion = function() {
    if (config.switches.enableDiscussionSwitch && config.page.commentable) {
        const el = qwery('.discussion')[0];
        if (el) {
            new Loader().attachTo(el);
        }
    }
};

export { initCrosswordDiscussion };
