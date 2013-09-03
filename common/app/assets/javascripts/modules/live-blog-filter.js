/*
    Module: live-blog-filter.js
    Description: Filter displayed events depending on their type
*/
define([
    'common',
    'bonzo',
    'bean'
], function (
    common,
    bonzo,
    bean
) {
    'use strict';

    function Filter(context) {
        this.context = context || document;
        this.articleContainer = this.context.getElementsByClassName('js-article__container')[0];
        this.template =
            '<div class="live-blog-toggler-wrapper">' +
            '    <button class="live-blog-toggler live-blog-toggler--all u-button-reset js-live-blog-toggler" data-link-name="filter display key-events" title="View key events only">' +
            '        <span class="lbt__label">View</span>' +
            '        <span class="h">key events instead of</span>' +
            '        <span class="lbt__value">All posts</span>' +
            '    </button>' +
            '    <button class="live-blog-toggler live-blog-toggler--key-events u-button-reset js-live-blog-toggler" data-link-name="filter display all posts" title="View all posts">' +
            '        <span class="lbt__label">View</span>' +
            '        <span class="h">all posts instead of</span>' +
            '        <span class="lbt__value">Key events</span>' +
            '    </button>' +
            '</div>';
    }

    Filter.prototype.init = function() {
        var self = this;
        bonzo(this.context.getElementsByClassName('js-live-blog-filter')[0]).replaceWith(this.template);

        self.findKeyEvents.call(self);

        common.mediator.on('modules:autoupdate:loaded', function() {
            self.findKeyEvents.call(self);
        });

        bean.on(this.context, 'click', '.js-live-blog-toggler', function(e) {
            e.preventDefault();
            self.showKeyEvents.call(self);
        });
    };

    Filter.prototype.findKeyEvents = function() {
        if (this.articleContainer.getElementsByClassName('is-key-event').length) {
            bonzo(this.articleContainer).addClass('live-blog--has-key-events');
        }
    };

    Filter.prototype.showKeyEvents = function() {
        bonzo(this.articleContainer).toggleClass('show-only-key-events');
    };

    return Filter;
});