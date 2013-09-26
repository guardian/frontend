define([
    'common',
    'bean',
    'ajax',
    'modules/component'
], function(
    common,
    bean,
    ajax,
    component
) {

/**
 * Singleton for loading a discussion into a page
 * @constructor
 * @param {Element=} context (optional)
 * @param {Object=} options (optional)
 */
var Loader = function(context, options) {
    this.context = context || document;
    for (var prop in options) {
        this.options[prop] = options[prop];
    }
};
component.create(Loader);

/** @type {Object.<string.*>} */
Loader.CONFIG = {
    classes: {
        component: 'js-show-discussion'
    },
    events: {
        prefix: 'discussion:loader',
        loading: 'loading'
    }
};

/**
 * @type {Object.<string.*>}
 * @override
 */
Loader.prototype.options = {
    root: null
};


/**
 * @override
 */
Loader.prototype.ready = function() {
    bean.on(this.context, 'click', [this.elem], this.handleClick.bind(this));
};

/**
 * @param {Event} e
 * @return {Reqwest}
 */
Loader.prototype.handleClick = function(e) {
    var id = e.currentTarget.getAttribute('data-discussion-id'),
        result = this.getDiscussion(id);

    e.preventDefault();
    result.then(
        this.success,
        this.fail
    );
};

/**
 * @param {string} id
 * @return {Reqwest}
 */
Loader.prototype.getDiscussion = function(id) {
    var url = '/discussion'+ id + '.json';
    this.emit('loading', { id: id });

    return ajax({
        url: url,
        type: 'json'
    });
};

/**
 * @param {Object} resp
 */
Loader.prototype.success = function(resp) {

};

/**
 * @param {XMLHttpRequest} xhr
 */
Loader.prototype.fail = function(xhr) {
    
};


return Loader;

}); //define