define(['common', 'bean'], function (common, bean) {

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
                cta.innerHTML = 'Show <span class="count">' + model.getCount() + '</span> ' + ((expanded) ? 'less' : 'more');
                cta.setAttribute('data-link-name', 'show ' + ((expanded) ? 'more' : 'less'));
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
                cta.className = 'cta expander b2';
                dom[0].appendChild(cta);
                view.updateCallToAction();
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

        this.initalise = function () {
            dom = common.$g('#' + id);

            if (model.getCount() < 3) {
                return false;
            }

            view.renderCallToAction();
            view.renderState(expanded);
        };
        
        // Bindings
        

        // view listeners
        common.mediator.on('modules:expandable:expandedChange:' + id, view.renderState);
        common.mediator.on('modules:expandable:expandedChange:' + id, view.updateCallToAction);

        // model listeners
        common.mediator.on('modules:expandable:cta:toggle:' + id, model.toggleExpanded);

    };

    return Expandable;
   
});

