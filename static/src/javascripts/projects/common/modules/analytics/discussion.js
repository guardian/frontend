import $ from 'lib/$';
import bonzo from 'bonzo';
import config from 'lib/config';
import debounce from 'lodash/debounce';
import { mediator } from 'lib/mediator';

let seen = false;

const sendToGA = (label, customDimensions = {}) => {
    const tracker = config.get('googleAnalytics.trackers.editorial');

    window.ga(
        `${tracker}.send`,
        'event',
        'element view',
        'onpage item',
        label,
        Object.assign(
            {
                nonInteraction: true, // to avoid affecting bounce rate
            },
            customDimensions
        )
    );
};

const jumpedToComments = () => {
    if (!seen) {
        seen = true;
    }
};

const commentPermalink = () => {
    if (!seen) {
        seen = true;
    }
};

const scrolledToComments = () => {
    if (!seen) {
        sendToGA('scroll to comments');
        seen = true;
    }
};

const areCommentsVisible = () => {
    const comments = $('#comments').offset();
    const scrollTop = window.pageYOffset;
    const viewport = bonzo.viewport().height;

    if (
        comments.top - viewport / 2 < scrollTop &&
        comments.top + comments.height - viewport / 3 > scrollTop
    ) {
        return true;
    }

    return false;
};

// Convenience functions
const areCommentsSeen = () => {
    const scroll = () => {
        if (!seen && areCommentsVisible()) {
            scrolledToComments();
            mediator.off('window:throttledScroll', debounce(scroll, 200));
        }
    };

    if (!seen) {
        mediator.on('window:throttledScroll', debounce(scroll, 200));
    }
};

const initDiscussionAnalytics = () => {
    mediator.on('discussion:seen:comment-permalink', commentPermalink);
    mediator.on('discussion:seen:comments-anchor', jumpedToComments);

    areCommentsSeen();
};

export { initDiscussionAnalytics };
