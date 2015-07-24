import config from 'common/utils/config';
import DiscussionLoader from 'common/modules/discussion/loader';
import qwery from 'qwery';

function loadComments() {

    if (config.switches.discussion && config.page.commentable) {
        var el = qwery('.discussion')[0];
        if (el) {
            new DiscussionLoader().attachTo(el);
        }
    }
}

export default { 'loadComments' : loadComments }
