/*
    Module: expandable.js
    Description: Used to make a list of items expand and contract
*/
define(['common', 'bean'], function (common, bean) {
    /*
        @param {Object} options hash of configuration options:
            id          : {String}  Id of DOM element to convert
            expanded    : {Boolean} Whether the component should init in an expanded state
    */
    var Expandable = function (opts) {

        var dom, // root element of the trailblock
            id = opts.id,
            expanded = (opts.hasOwnProperty('expanded')) ? expanded : true, // true = open, false = closed
            cta = document.createElement('span'),
            domCount,
            count;

        // View
        
        var view = {
           
            updateCallToAction: function () {
                cta.innerHTML = 'Show ' + model.getCount() + ' ' + ((expanded) ? 'fewer' : 'more');
                cta.setAttribute('data-link-name', 'Show ' + ((expanded) ? 'more' : 'fewer'));
                cta.setAttribute('data-is-ajax', '1');
            },
            
            renderState: function (expanded) {
                if(expanded) {
                    dom.removeClass('shut');
                } else {
                    dom.addClass('shut');
                }
            },
            
            renderCallToAction: function () {
                bean.add(cta, 'click', function (e) {
                    common.mediator.emit('modules:expandable:cta:toggle:' + id);
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
        
            toggleExpanded: function (eventId) {
                expanded = (expanded) ? false : true;
                common.mediator.emit('modules:expandable:expandedChange:' + id, expanded);
            },

            getCount: function () {
                return dom.attr('data-count');
            },

            isOpen: function () {
                return (dom.hasClass('shut')) ? false : true;
            }
        };

        this.init = function () {
            dom = common.$g('#' + id);

            if (model.getCount() < 3) {
                return false;
            }

            view.renderCallToAction();
            view.renderState(expanded);
        };

        // view listeners
        common.mediator.on('modules:expandable:expandedChange:' + id, view.renderState);
        common.mediator.on('modules:expandable:expandedChange:' + id, view.updateCallToAction);
        common.mediator.on('modules:expandable:expandedChange:' + id, view.scrollToCallToAction);

        // model listeners
        common.mediator.on('modules:expandable:cta:toggle:' + id, model.toggleExpanded);

    };

    return Expandable;
   
});

