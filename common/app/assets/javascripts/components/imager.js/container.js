/* globals Imager */
(function (strategies) {
    'use strict';

    /**
     * Create a new Responsive Image Container strategy instance.
     * It implies to work on an HTML structure described in example.
     *
     * @param {ImagerStrategyOptions} options
     * @constructor
     * @example
     * <div data-src="http://example.com/images/picture-{width}.jpg"></div>
     */
    function ImagerContainerStrategy (options) {
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
    ImagerContainerStrategy._id = 'container';

    /**
     * Iterates on an element content to discover its responsive placeholder.
     * It's a way to respect any existing content without defacing it.
     *
     * @param {HTMLElement} element
     * @param {Function=} callback
     * @returns {boolean}
     */
    ImagerContainerStrategy.prototype.applyOnPlaceholder = function applyOnPlaceholder (element, callback) {
        var i = element.children.length;

        while (i--) {
            if (element.children[i].className.match(new RegExp('(^| )' + this.matchingClassName + '( |$)'))) {
                if (callback) {
                    callback(element.children[i], element);
                }

                return true;
            }
        }

        return false;
    };

    /**
     * Creates a new responsive placeholder.
     * Generally the proper dimension is calculated asynchronously on a next tick/frame.
     *
     * @param {HTMLElement} element
     */
    ImagerContainerStrategy.prototype.createPlaceholder = function createPlaceholder (element) {
        var placeholder = this.element.cloneNode();

        if (element.hasAttribute('data-width')) {
            placeholder.width = element.getAttribute('data-width');
        }

        placeholder.className = this.matchingClassName;

        element.appendChild(placeholder);

        return element;
    };

    /**
     * Indicates if a placeholder needs to be injected.
     *
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    ImagerContainerStrategy.prototype.requiresPlaceholder = function requiresPlaceholder (element) {
        return element.hasAttribute('data-src') && this.applyOnPlaceholder(element) === false;
    };

    /**
     * Updates the placeholder or existing responsive image with a given URI.
     *
     * @param {HTMLElement} element
     * @param {String} uri
     */
    ImagerContainerStrategy.prototype.updatePlaceholderUri = function updatePlaceholderUri (element, uri) {
        this.applyOnPlaceholder(element, function (placeholder) {
            placeholder.src = uri;
        });
    };

    // Exporting
    strategies[ImagerContainerStrategy._id] = ImagerContainerStrategy;
})(Imager.strategies);
