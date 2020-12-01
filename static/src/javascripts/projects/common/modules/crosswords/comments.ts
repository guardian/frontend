import { Loader } from 'common/modules/discussion/loader';
import config from 'lib/config';

const initCrosswordDiscussion = () => {
    if (
        config.get('switches.enableDiscussionSwitch') &&
        config.get('page.commentable')
    ) {
        const el = document.getElementsByClassName('discussion')[0];
        if (el) {
            new Loader().attachTo(el);
        }
    }
};

export { initCrosswordDiscussion };
