define([
    'bean'
], function(bean) {

/**
 * Singleton for loading a discussion into a page
 * @type {Object}
 */
var Loader = {};

/** @type {Object.<string.*>} */
Loader.CONFIG = {
    classes: {
        getDiscussion: 'js-show-discussion'
    }
};

/**
 * @type {Object.<string.*>}
 */
Loader.options = {
    apiRoot: null
};

/**
 * @param {Element} context
 * @param {Object=} options
 */
Loader.init = function(context, options) {
    for (var prop in options) {
        Loader.options[prop] = options[prop];
    }

    Loader.bindEvents(context);
};

/**
 * @param {Element} context
 * @param {String} buttonClass
 */
Loader.bindEvents = function(context) {
    bean.on(context, 'click', '.'+ Loader.CONFIG.classes.getDiscussion, Loader.handleGetDiscussion);
};

/**
 * @param {Event} e
 * @return {Reqwest}
 */
Loader.handleGetDiscussion = function(e) {
    var id = e.currentTarget;
    e.preventDefault();
    Loader.getDiscussion(id);
};

/**
 * @param {string} id
 */
Loader.getDiscussion = function(id) {

};
return Loader;

}); //define