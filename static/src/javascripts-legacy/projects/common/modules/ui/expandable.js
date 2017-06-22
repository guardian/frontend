/*
    Module: expandable.js
    Description: Used to make a list of items expand and contract
*/
define(['lib/$', 'bean', 'bonzo'], function($, bean, bonzo) {
    /*
        @param {Object} options hash of configuration options:
            dom           : DOM element to convert
            expanded      : {Boolean} Whether the component should init in an expanded state
            showCount     : {Boolean} Whether to display the count in the CTA
            buttonAfterEl : {Element} Element to add the button after (defaults to last child of dom)
    */
    var Expandable = function(options) {
        var opts = options || {},
            dom = $(opts.dom), // root element of the trailblock
            expanded = opts.expanded === false ? false : true, // true = open, false = closed
            cta = document.createElement('button'),
            showCount = opts.showCount === false ? false : true,
            renderState = function() {
                if (expanded) {
                    dom.removeClass('shut');
                } else {
                    dom.addClass('shut');
                }
            },
            getCount = function() {
                return parseInt(dom.attr('data-count'), 10);
            },
            updateCallToAction = function() {
                var text = 'Show ';
                if (showCount) {
                    text += getCount() + ' ';
                }
                text += expanded ? 'fewer' : 'more';
                cta.innerHTML = text;
                cta.setAttribute(
                    'data-link-name',
                    'Show ' + (expanded ? 'more' : 'fewer')
                );
                cta.setAttribute('data-is-ajax', '1');
            },
            // Model
            model = {
                toggleExpanded: function() {
                    expanded = expanded ? false : true;
                    renderState();
                    updateCallToAction();
                },

                getCount: getCount,

                isOpen: function() {
                    return dom.hasClass('shut') ? false : true;
                },
            },
            // View
            view = {
                updateCallToAction: updateCallToAction,

                renderState: renderState,

                renderCallToAction: function() {
                    bean.add(cta, 'click', function() {
                        model.toggleExpanded();
                    });
                    cta.className = 'cta';
                    if (opts.buttonAfterEl) {
                        bonzo(opts.buttonAfterEl).after(cta);
                    } else {
                        dom[0].appendChild(cta);
                    }
                    view.updateCallToAction();
                },

                scrollToCallToAction: function() {
                    // feels a bit hacky but need to give the transition time to finish before scrolling
                    if (!expanded) {
                        window.setTimeout(function() {
                            cta.scrollIntoView();
                        }, 550);
                    }
                },
            };

        return {
            init: function() {
                if (
                    dom.hasClass('expandable-initialised') ||
                    !dom.html() ||
                    model.getCount() < 3
                ) {
                    return false;
                }
                dom.addClass('expandable-initialised');

                view.renderCallToAction();
                view.renderState();
            },
            toggle: model.toggleExpanded,
        };
    };

    return Expandable;
});
