/*
    Module: live-filter.js
    Description: Filter displayed events depending on their type
*/
define([
    'bonzo',
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/mediator',
    'lodash/collections/toArray'
], function (
    bonzo,
    bean,
    qwery,
    $,
    mediator,
    toArray) {
    function Filter(context) {
        this.context = context;
        this.order = 'newest';
        console.log('foo2');
    }

    Filter.prototype.ready = function () {
        bean.on(qwery('.js-live-oldest')[0], 'click', this.toggle.bind(this, 'oldest'));
        bean.on(qwery('.js-live-newest')[0], 'click', this.toggle.bind(this, 'newest'));
    };

    Filter.prototype.toggle = function (order) {
        bean.fire(qwery('button[data-toggle="popup--live-blog"]')[0], 'click');
        if (this.order !== order) {
            var blocks = toArray($('.block', this.context).detach());
            blocks.reverse();
            bonzo(this.context).prepend(blocks);
            mediator.emit('module:filter:toggle', order === 'oldest');
            this.order = order;
        }
    };

    return Filter;
});
