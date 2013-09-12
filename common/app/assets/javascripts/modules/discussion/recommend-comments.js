define([
    'common',
    'bean',
    'ajax'
], function(common, bean, ajax) {

/**
 * @type {Object}
 */
var RecommendComments = {};

/** @type {Object.<string.*>} */
RecommendComments.CONFIG = {
    classes: {
        button: 'js-recommend-comment',
        count: 'js-recommend-count'
    },
    endpoints: {
        recommend: '/comment/:id/recommend'
    },
    events: {
        prefix: 'discussion:comment:recommend:',
        init: 'initialised',
        success: 'success',
        fail: 'fail'
    }
};

/**
 * @type {Object.<string.*>}
 */
RecommendComments.options = {
    apiRoot: 'http://discussion.release.dev-guardianapis.com/discussion-api'
};

/**
 * @param {Element} context
 */
RecommendComments.init = function(context, options) {
    var buttons = context.querySelectorAll('.'+ RecommendComments.CONFIG.classes.button);

    for (var prop in options) {
        RecommendComments.options[prop] = options[prop];
    }

    if (buttons) {
        Array.prototype.forEach.call(buttons, function(button) {
            button.innerHTML = button.innerHTML.replace('Recommended', 'Recommend');
            button.className = button.className + ' d-comment__action--active';
        });
        RecommendComments.bindEvents(context);
        common.mediator.emit(RecommendComments.getEvent('init'));
    }
};


/**
 * @param {Element} context
 * @param {String} buttonClass
 */
RecommendComments.bindEvents = function(context) {
    bean.on(context, 'click', '.'+ RecommendComments.CONFIG.classes.button, RecommendComments.handleClick);
};

/**
 * @param {Event} e
 * @return {Reqwest}
 */
RecommendComments.handleClick = function(e) {
    var elem = e.currentTarget,
        id = elem.getAttribute('data-comment-id'),
        result = RecommendComments.recommendComment(id);

    // This is used as we are using deffered events
    elem.className = elem.className
                        .replace(RecommendComments.CONFIG.classes.button, '')
                        .replace('d-comment__action--active', '');
    
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
    var url = RecommendComments.options.apiRoot + RecommendComments.CONFIG.endpoints.recommend.replace(':id', id);
    return ajax({
        url: url,
        type: 'json'
    });
};

/**
 * @param {Object} resp
 */
RecommendComments.success = function(resp) {
    common.mediator.emit(
        RecommendComments.getEvent('success'),
        {
            id: parseInt(this.getAttribute('data-comment-id'), 10),
            count: parseInt(this.getAttribute('data-recommend-count'), 10)
        }
    );
};

/**
 * @param {XMLHttpRequest} xhr
 */
RecommendComments.fail = function(xhr) {
    RecommendComments.renderRecommendation(this, true);
    // This is used as we are using deffered events
    this.className = this.className +' '+ RecommendComments.CONFIG.classes.button +' d-comment__action--active';

    common.mediator.emit(
        RecommendComments.getEvent('fail'),
        {
            id: parseInt(this.getAttribute('data-comment-id'), 10),
            count: parseInt(this.getAttribute('data-recommend-count'), 10)
        }
    );
};

/**
 * @param {Element} elem
 * @param {Boolean=} unrecommend
 */
RecommendComments.renderRecommendation = function(elem, unrecommend) {
    var recommendCountElem = elem.querySelector('.'+ RecommendComments.CONFIG.classes.count),
        currentCount = parseInt(elem.getAttribute('data-recommend-count'), 10),
        newCount = !unrecommend ? currentCount+1 : currentCount-1;

    recommendCountElem.innerHTML = newCount;
    elem.setAttribute('data-recommend-count', newCount);
};

/**
 * @param {string} eventName
 * @return null
 */
RecommendComments.getEvent = function(eventName) {
    return (RecommendComments.CONFIG.events.prefix + RecommendComments.CONFIG.events[eventName]) || null;
};

return RecommendComments;

}); // define