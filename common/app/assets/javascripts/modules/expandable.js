/*
    Module: expandable.js
    Description: Used to make a list of items expand and contract
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
    /*
        @param {Object} options hash of configuration options:
            dom         : DOM element to convert
            expanded    : {Boolean} Whether the component should init in an expanded state
            showCount   : {Boolean} Whether to display the count in the CTA
    */
    var Expandable = function (options) {

        var opts = options || {},
            dom = common.$g(opts.dom), // root element of the trailblock
            expanded = (opts.expanded === false) ? false : true, // true = open, false = closed
            count,
            self = this,
            showCount = (opts.showCount === false) ? false : true;

        var btn =  '<div class="cta">';
            btn += '<span class="cta__text">Show more</span><button class="cta__btn cta__btn--right">';
            btn += '<i class="i i-arrow-blue-down cta__icn"></i></button></div>';

        var cta = bonzo(bonzo.create(btn))[0];

        // View
        
        var view = {
           
            updateCallToAction: function () {
                var text = 'Show ';
                if (showCount) {
                    text += model.getCount() + ' ';
                }
                text += (expanded) ? 'fewer' : 'more';
                cta.querySelector('.cta__text').innerHTML = text;
                cta.setAttribute('data-link-name', 'Show ' + ((expanded) ? 'more' : 'fewer'));
                cta.setAttribute('data-is-ajax', '1');
            },
            
            renderState: function () {
                if(expanded) {
                    dom.removeClass('is-shut');
                } else {
                    dom.addClass('is-shut');
                }
            },
            
            renderCallToAction: function () {
                bean.add(cta, 'click', function (e) {
                    model.toggleExpanded();
                });
                cta.className = 'cta expander';
                dom[0].appendChild(cta);
                view.updateCallToAction();
            },

            scrollToCallToAction: function () {
                // feels a bit hacky but need to give the transition time to finish before scrolling
                if (!expanded) {
                    window.setTimeout(function () {
                        cta.scrollIntoView();
                    }, 550);
                }
            }
        };
        
        // Model

        var model = {
        
            toggleExpanded: function () {
                expanded = (expanded) ? false : true;
                view.renderState();
                view.updateCallToAction();
            },

            getCount: function () {
                return parseInt(dom.attr('data-count'), 10);
            },

            isOpen: function () {
                return (dom.hasClass('shut')) ? false : true;
            }
        };

        return {
            init: function() {

                if (dom.hasClass('expandable-initialised') || !dom.html() || model.getCount() < 3) {
                    return false;
                }
                dom.addClass('expandable-initialised');

                view.renderCallToAction();
                view.renderState();
            },
            toggle: model.toggleExpanded
        };
    };

    return Expandable;
   
});

