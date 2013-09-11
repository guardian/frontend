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
    bean.one(context, 'click', '.'+ RecommendComments.CONFIG.classes.button, RecommendComments.handleClick);
};

/**
 * @param {Event} e
 */
RecommendComments.handleClick = function(e) {
    var elem = e.target,
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

RecommendComments.success = function(resp) {
    console.log(this, resp);
};

RecommendComments.fail = function(resp) {
    RecommendComments.renderRecommendation(this, true);
};

/**
 * @param {Element} elem
 * @param {Boolean=} unrecommend
 */
RecommendComments.renderRecommendation = function(elem, unrecommend) {
    var recommendCountElem = elem.querySelector('.'+ RecommendComments.CONFIG.classes.count),
        currentCount = parseInt(recommendCountElem.getAttribute('data-recommend-count')),
        newCount = !unrecommend ? currentCount+1 : currentCount-1;

    recommendCountElem.innerHTML = newCount;
    recommendCountElem.setAttribute('data-recommend-count', newCount);
};

return RecommendComments;

}); // define