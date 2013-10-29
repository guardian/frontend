/* globals Imager */
(function (strategies) {
    'use strict';

    /**
     * Create a new Responsive Image Replacer strategy instance.
     * It implies to work on an HTML structure described in example.
     *
     * @param {ImagerStrategyOptions} options
     * @constructor
     * @example
     * <div data-src="http://example.com/images/picture-{width}.jpg"></div>
     */
    function ImagerReplacerStrategy (options) {
        options = options || {};

        this.matchingClassName = options.matchingClassName || 'responsive-img';
        this.element = options.element || document.createElement('img');
        this.element.src = options.src || 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
        this.element.className += ' ' + this.matchingClassName;
    }

    /**
     * Strategy identifier.
     *
     * @type {string}
     * @private
     */
    ImagerReplacerStrategy._id = 'replacer';

    /**
     * Iterates on an element content to discover its responsive placeholder.
     * It's a way to respect any existing content without defacing it.
     *
     * @param {HTMLElement} element
     * @param {Function=} callback
     * @returns {boolean}
     */
    ImagerReplacerStrategy.prototype.applyOnPlaceholder = function applyOnPlaceholder (element, callback) {
        if (element.className.match(new RegExp('(^| )' + this.matchingClassName + '( |$)'))) {
            if (callback) {
                callback(element, element);
            }

            return true;
        }

        return false;
    };

    /**
     * Creates a new responsive placeholder.
     * Generally the proper dimension is calculated asynchronously on a next tick/frame.
     *
     * @param {HTMLElement} element
     */
    ImagerReplacerStrategy.prototype.createPlaceholder = function createPlaceholder (element) {
        var placeholder = this.element.cloneNode();

        if (element.hasAttribute('data-width')) {
            placeholder.width = element.getAttribute('data-width');
            placeholder.setAttribute('data-width', element.getAttribute('data-width'));
        }

        placeholder.className += ' ' + element.className;
        placeholder.setAttribute('data-src', element.getAttribute('data-src'));

        //DocumentFragment and Array elements won't have a parentNode
        if (element.parentNode) {
            element.parentNode.replaceChild(placeholder, element);
        }

        return placeholder;
    };

    /**
     * Indicates if a placeholder needs to be injected.
     *
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    ImagerReplacerStrategy.prototype.requiresPlaceholder = function requiresPlaceholder (element) {
        return element.hasAttribute('data-src') && !this.applyOnPlaceholder(element);
    };

    /**
     * Updates the placeholder or existing responsive image with a given URI.
     *
     * @param {HTMLElement} element
     * @param {String} uri
     */
    ImagerReplacerStrategy.prototype.updatePlaceholderUri = function updatePlaceholderUri (element, uri) {
        this.applyOnPlaceholder(element, function (placeholder) {
            placeholder.src = uri;
        });
    };

    // Exporting
    strategies[ImagerReplacerStrategy._id] = ImagerReplacerStrategy;
})(Imager.strategies);
