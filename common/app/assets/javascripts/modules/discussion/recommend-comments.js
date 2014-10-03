define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/mediator',
    'common/modules/discussion/api',
    'common/modules/identity/api'
], function(
    bean,
    bonzo,
    qwery,
    mediator,
    DiscussionApi,
    IdApi
) {

/**
 * @type {Object}
 */
var RecommendComments = {};

/** @type {Object.<string.*>} */
RecommendComments.CONFIG = {
    classes: {
        button: 'js-recommend-comment',
        count: 'js-recommend-count',
        active: 'd-comment__recommend--active',
        userRecommended: 'd-comment__recommend--user-recommended',
        open: 'd-discussion--recommendations-open'
    },
    events: {
        prefix: 'discussion:comment:recommend:',
        init: 'initialised',
        success: 'success',
        fail: 'fail'
    }
};

/**
 * @param {Object=} options
 */
RecommendComments.init = function(options) {
    var buttons;

    this.open = this.open || qwery('.'+ RecommendComments.CONFIG.classes.open).length > 0;

    if (this.open) {
        buttons = qwery('.'+ RecommendComments.CONFIG.classes.button);
    }

    for (var prop in options) {
        RecommendComments.options[prop] = options[prop];
    }

    if (buttons) {
        RecommendComments.initButtons(buttons);
        RecommendComments.bindEvents();
        mediator.emit(RecommendComments.getEvent('init'));
    }
};

RecommendComments.initButtons = function(buttons) {
    bonzo(buttons).each(function(button) {
        var user = IdApi.getUserFromCookie(),
            userId = user ? user.id : null,
            isSameUser = button.getAttribute('data-user-id') === userId;

        if (!userId || !isSameUser) {
            bonzo(button).addClass(RecommendComments.CONFIG.classes.active);
            button.title = button.title += ' - recommend this comment';
        }
    });
};

RecommendComments.bindEvents = function() {
    bean.on(document.body, 'click', '.'+ RecommendComments.CONFIG.classes.active, RecommendComments.handleClick);
};

/**
 * @param {Event} e
 * @return {Reqwest}
 */
RecommendComments.handleClick = function(e) {
    var elem = e.currentTarget,
        id = elem.getAttribute('data-comment-id'),
        result = RecommendComments.recommendComment(id);

    // Remove button class to remove event handler
    // as it is delegated
    elem.className = elem.className.replace(RecommendComments.CONFIG.classes.active, '');

    RecommendComments.renderRecommendation(elem);
    return result.then(
        RecommendComments.success.bind(elem),
        RecommendComments.fail.bind(elem)
    );
};

/**
 * @param {number} id
 * @return {Reqwest}
 */
RecommendComments.recommendComment = function(id) {
    return DiscussionApi.recommendComment(id);
};

/**
 * @param {Object} resp
 */
RecommendComments.success = function() {
    mediator.emit(
        RecommendComments.getEvent('success'),
        {
            id: parseInt(this.getAttribute('data-comment-id'), 10),
            userId: parseInt(this.getAttribute('data-user-id'), 10),
            count: parseInt(this.getAttribute('data-recommend-count'), 10)
        }
    );
};

/**
 * @param {XMLHttpRequest} xhr
 */
RecommendComments.fail = function(xhr) {
    var resp = xhr.responseText !== 'NOT FOUND' && xhr.responseText !== '' ? JSON.parse(xhr.responseText) : {};

    RecommendComments.renderRecommendation(this, true);
    if (resp.errorCode === 'CAN\'T_RECOMMEND_SAME_COMMENT_TWICE') {
        this.className = this.className.replace(RecommendComments.CONFIG.classes.active, '');
        this.title = 'You cannot recommend the same comment twice';
    }
    this.className = this.className +' '+ RecommendComments.CONFIG.classes.button;

    mediator.emit(
        RecommendComments.getEvent('fail'),
        {
            id: parseInt(this.getAttribute('data-comment-id'), 10),
            count: parseInt(this.getAttribute('data-recommend-count'), 10),
            errorCode: resp.errorCode
        }
    );
};

/**
 * @param {Element} elem
 * @param {Boolean=} unrecommend
 */
RecommendComments.renderRecommendation = function(elem, unrecommend) {
    var currentCount = parseInt(elem.getAttribute('data-recommend-count'), 10),
        newCount = !unrecommend ? currentCount+1 : currentCount-1;

    if (!unrecommend) {
        // remove active and add recommended
        bonzo(elem)
            .addClass(RecommendComments.CONFIG.classes.userRecommended)
            .removeClass(RecommendComments.CONFIG.classes.active);
    } else {
        // add active and remove recommended
        bonzo(elem)
            .addClass(RecommendComments.CONFIG.classes.active)
            .removeClass(RecommendComments.CONFIG.classes.userRecommended);
    }

    elem.setAttribute('data-recommend-count', newCount);
};

/**
 * @param {string} eventName
 * @return string|null
 */
RecommendComments.getEvent = function(eventName) {
    return (RecommendComments.CONFIG.events.prefix + RecommendComments.CONFIG.events[eventName]) || null;
};

return RecommendComments;

}); // define
