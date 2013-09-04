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
            '<div class="live-toggler-wrapper live-widget">' +
            '    <button class="u-button-reset live-toggler live-toggler--all js-live-toggler" data-link-name="filter display key-events" title="Show key events only">' +
            '        <span class="lt__label">Show</span>' +
            '        <span class="h">key events instead of</span>' +
            '        <span class="lt__value">All posts</span>' +
            '    </button>' +
            '    <button class="u-button-reset live-toggler live-toggler--key-events js-live-toggler" data-link-name="filter display all posts" title="Show all posts">' +
            '        <span class="lt__label">Show</span>' +
            '        <span class="h">all posts instead of</span>' +
            '        <span class="lt__value">Key events</span>' +
            '    </button>' +
            '</div>';
    }

    Filter.prototype.init = function() {
        var self = this;
        bonzo(this.context.getElementsByClassName('js-live-filter')[0]).replaceWith(this.template);

        this.findKeyEvents();

        common.mediator.on('modules:autoupdate:loaded', function() {
            self.findKeyEvents.call(self);
        });

        bean.on(this.context, 'click', '.js-live-toggler', function(e) {
            e.preventDefault();
            self.showKeyEvents.call(self);
        });
    };

    Filter.prototype.findKeyEvents = function() {
        if (this.articleContainer.getElementsByClassName('is-key-event').length) {
            bonzo(this.articleContainer).addClass('has-key-events');
        }
    };

    Filter.prototype.showKeyEvents = function() {
        bonzo(this.articleContainer).toggleClass('show-only-key-events');
    };

    return Filter;
});