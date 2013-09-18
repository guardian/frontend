/*
    Module: live-filter.js
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
            '<div class="live-toggler-wrapper">' +
            '  <button class="u-button-reset live-toggler live-toggler--all js-live-toggler"' +
            '          data-link-name="filter show key-events" title="Show key events only">' +
            '    <span class="lt__label">Showing</span>' +
            '    <span class="u-h">key events instead of</span>' +
            '    <span class="lt__value">All posts</span>' +
            '  </button>' +
            '  <button class="u-button-reset live-toggler live-toggler--key-events js-live-toggler"' +
            '          data-link-name="filter show all posts" title="Show all posts">' +
            '    <span class="lt__label">Showing</span>' +
            '    <span class="u-h">all posts instead of</span>' +
            '    <span class="lt__value">Key events</span>' +
            '  </button>' +
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

        bean.on(window, 'hashchange', function() {
            // Disable the filter on url hash changes
            // Prevents linking to blocks which may otherwise be hidden
            var hash = window.location.hash;

            if (hash.indexOf('#block-') === 0) {
                self.disable();
                var blockEl = document.getElementById(hash.replace('#', ''));
                window.scrollTo(0, bonzo(blockEl).offset().top);
            }
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

    Filter.prototype.disable = function() {
        bonzo(this.articleContainer).removeClass('show-only-key-events');
    };

    return Filter;
});
