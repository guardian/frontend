define([
    'bean',
    'qwery',
    'common/utils/mediator',
    'common/modules/discussion/api',
    'common/modules/identity/api'
], function(
    bean,
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
 * @param {Element} context
 * @param {Object=} options
 */
RecommendComments.init = function(context, options) {
    var buttons;

    this.open = this.open || qwery('.'+ RecommendComments.CONFIG.classes.open, context).length > 0;

    if (this.open) {
        buttons = qwery('.'+ RecommendComments.CONFIG.classes.button, context);
    }

    for (var prop in options) {
        RecommendComments.options[prop] = options[prop];
    }

    if (buttons) {
        Array.prototype.forEach.call(buttons, function(button) {
            var user = IdApi.getUserFromCookie(),
                userId = user ? user.id : null,
                isSameUser = button.getAttribute('data-user-id') === userId;

            if (!userId || !isSameUser) {
                button.className = button.className + ' ' + RecommendComments.CONFIG.classes.active;
                button.title = button.title += ' - recommend this comment';
            }
        });
        RecommendComments.bindEvents(context);
        mediator.emit(RecommendComments.getEvent('init'));
    }
};

/**
 * @param {Element} context
 */
RecommendComments.bindEvents = function(context) {
    bean.on(context, 'click', '.'+ RecommendComments.CONFIG.classes.active, RecommendComments.handleClick);
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
RecommendComments.success = function(resp) {
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
    if (resp.errorCode === "CAN'T_RECOMMEND_SAME_COMMENT_TWICE") {
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
    var recommendCountElem = qwery('.'+ RecommendComments.CONFIG.classes.count, elem)[0],
        currentCount = parseInt(elem.getAttribute('data-recommend-count'), 10),
        newCount = !unrecommend ? currentCount+1 : currentCount-1;

    if (!unrecommend) {
        // remove active and add recommended
        elem.className = (elem.className + ' ' + RecommendComments.CONFIG.classes.userRecommended)
                            .replace(RecommendComments.CONFIG.classes.active, '');
    } else {
        // add active and remove recommended
        elem.className = (elem.className + ' ' + RecommendComments.CONFIG.classes.active)
                            .replace(RecommendComments.CONFIG.classes.userRecommended, '');
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
