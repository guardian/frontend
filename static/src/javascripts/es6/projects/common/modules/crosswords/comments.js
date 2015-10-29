import config from 'common/utils/config';
import DiscussionLoader from 'common/modules/discussion/loader';
import qwery from 'qwery';

export default () => {

    if (config.switches.discussion && config.page.commentable) {
        const el = qwery('.discussion')[0];
        if (el) {
            new DiscussionLoader().attachTo(el);
        }
    }
};
