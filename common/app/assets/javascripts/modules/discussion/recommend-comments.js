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
    urls: {
        api: 'http://discussion.release.dev-guardianapis.com/discussion-api'
    },
    endpoints: {
        recommend: '/comment/:id/recommend'
    }
};

/**
 * Bind to all buttons
 */
RecommendComments.bindEvents = function(context) {
    // Clicking
    var buttonClass = '.'+ RecommendComments.CONFIG.classes.button,
        buttons = context.querySelectorAll(buttonClass);

    if (buttons) {
        Array.prototype.forEach.call(buttons, function(button) {
            button.innerHTML = button.innerHTML.replace('Recommended', 'Recommend');
        });
        bean.on(context, 'click', buttonClass, RecommendComments.handleClick);
    }
};

/**
 * @param {Event} e
 */
RecommendComments.handleClick = function(e) {
    var elem = e.srcElement,
        id = elem.getAttribute('data-comment-id'),
        result = RecommendComments.recommendComment(id);

    RecommendComments.renderRecommendation(elem);
    result.then(RecommendComments.success.bind(elem), RecommendComments.fail.bind(elem));
};

/**
 * @param {number} id
 * @return {Reqwest}
 */
RecommendComments.recommendComment = function(id) {
    var url = RecommendComments.CONFIG.urls.api + RecommendComments.CONFIG.endpoints.recommend.replace(':id', id);
    return ajax({ url: url });
};

/**
 * @param {Object} resp
 */
RecommendComments.success = function(resp) {
    common.mediator.emit('discussion:comment:recommended', parseInt(this.getAttribute('data-recommend-count'), 10));
};

/**
 * @param {XMLHttpRequest} xhr
 */
RecommendComments.fail = function(xhr) {
    RecommendComments.renderRecommendation(this, true);
    bean.one(this, 'click', RecommendComments.handleClick);
};

/**
 * @param {Element} elem
 * @param {Boolean=} unrecommend
 */
RecommendComments.renderRecommendation = function(elem, unrecommend) {
    var recommendCountElem = elem.querySelector('.'+ RecommendComments.CONFIG.classes.count),
        currentCount = parseInt(recommendCountElem.getAttribute('data-recommend-count'), 10),
        newCount = !unrecommend ? currentCount+1 : currentCount-1;

    recommendCountElem.innerHTML = newCount;
    recommendCountElem.setAttribute('data-recommend-count', newCount);
};

return RecommendComments;

}); // define