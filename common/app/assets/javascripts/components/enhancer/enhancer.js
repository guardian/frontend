define([
    'require'
], function (
    require
) {

    /**
     * Render a DOM Node that supports progressive enhancement via a
     * boot.js script.
     *
     * @param {Node} el The DOM Node to apply the script to.
     * @param {Node} context The page container, typically <body> or any top-level wrapper node.
     * @param {Object} config A set of configuration variables.
     * @param {Mediator} mediator A pub/sub object to listen to and emit global events to the page.
     */
    function render(el, context, config, mediator) {

        var interactiveAttr = el.getAttribute('data-interactive'),
            element = el;

        // Backward compatibility with relative paths.
        // data-interactive attributes should be absolute from now
        // onwards.
        var bootUrl;
        if (/^https?:\/\//.test(interactiveAttr)) {
            bootUrl = interactiveAttr;
        } else {
            bootUrl = config.page.interactiveUrl + interactiveAttr + '/boot.js';
        }

        // The contract here is that the interactive module MUST return an object
        // with a method called 'boot'.

        require([bootUrl], function (interactive) {
            // We pass the standard context and config here, but also inject the
            // mediator so the external interactive can respond to our events.
            interactive.boot(element, context, config, mediator);
        });
    }

    return {
        render: render
    };
});
