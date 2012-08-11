define(['common', 'vendor/bean-0.4.11-1'], function(common, bean) { 

    var Expandable = function(id) { // FIXME pass id, not dom reference

        var dom, // root element of the trailblock
            id = id,
            expanded, // true = open, false = closed
            cta = document.createElement('div'),
            domCount,
            count;

        // View 
        
        var view = {
           
            updateCallToAction: function() {
                cta.innerHTML = (expanded) ? 'less' : 'more';
            },
            
            renderCount: function(count) {
                dom.append('<div class="count">' + 
                                count +
                           '</div>');
            },

            renderState: function(expanded) {
                (expanded) ? dom.removeClass('shut') : dom.addClass('shut'); 
            },
            
            renderCallToAction: function() {
                bean.add(cta, 'click', function(e) {
                    common.mediator.emit('modules:expandable:cta:toggle:' + id);
                });
                cta.className = 'cta';
                dom[0].appendChild(cta);
                view.updateCallToAction();
            },
        }
        
        // Model

        var model = {
        
            toggleExpanded: function(eventId) {
                expanded = (expanded) ? false : true;
                common.mediator.emit('modules:expandable:expandedChange:' + id, expanded)
            },

            getCount: function() {
                return dom.attr('data-count')
            },

            isOpen: function() { 
                return (dom.hasClass('shut')) ? false : true;
            }
        }

        this.initalise = function() {
            dom = common.$('#' + id);
            expanded = model.isOpen();
            view.renderCount(model.getCount()); 
            view.renderCallToAction(); 
        }
        
        // Bindings
        
        // init
        common.mediator.on('modules:related:render', this.initalise);

        // view listeners
        common.mediator.on('modules:expandable:expandedChange:' + id, view.renderState);
        common.mediator.on('modules:expandable:expandedChange:' + id, view.updateCallToAction);

        // model listeners
        common.mediator.on('modules:expandable:cta:toggle:' + id, model.toggleExpanded);

    }

    return Expandable 
   
});

