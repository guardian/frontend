define(['common', 'vendor/bean-0.4.11-1'], function(common, bean) { 

    var Expandable = function(opts) {

        var dom, // root element of the trailblock
            id = opts.id,
            expanded = (opts.hasOwnProperty('expanded')) ? expanded : true, // true = open, false = closed
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
            view.renderCount(model.getCount()); 
            view.renderCallToAction();
            view.renderState(expanded); 
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

