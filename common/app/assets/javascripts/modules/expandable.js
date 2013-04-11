/*
    Module: expandable.js
    Description: Used to make a list of items expand and contract
*/
define(['common', 'bean'], function (common, bean) {
    /*
        @param {Object} options hash of configuration options:
            dom         : DOM element to convert
            expanded    : {Boolean} Whether the component should init in an expanded state
    */
    var Expandable = function (opts) {

        var dom = common.$g(opts.dom), // root element of the trailblock
            expanded = (opts.hasOwnProperty('expanded')) ? expanded : true, // true = open, false = closed
            cta = document.createElement('span'),
            domCount,
            count,
            self = this;

        // View
        
        var view = {
           
            updateCallToAction: function () {
                cta.innerHTML = 'Show ' + model.getCount() + ' ' + ((expanded) ? 'fewer' : 'more');
                cta.setAttribute('data-link-name', 'Show ' + ((expanded) ? 'more' : 'fewer'));
                cta.setAttribute('data-is-ajax', '1');
            },
            
            renderState: function () {
                if(expanded) {
                    dom.removeClass('shut');
                } else {
                    dom.addClass('shut');
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
                if (! dom.html() || model.getCount() < 3) {
                    return false;
                }
                view.renderCallToAction();
                view.renderState();
            },
            toggle: model.toggleExpanded
        };
    };

    return Expandable;
   
});

