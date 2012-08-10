define(['common', 'vendor/bean-0.4.11-1'], function(common, bean) { 

    var Expandable = function(root) {

        var dom      = root, // root element of the trailblock
            id       = root.id,
            state, // true = open, false = closed
            cta      = document.createElement('div'),
            domCount = document.createElement('div'),
            count,
            that     = this;

        // View 
        
        var view = {
           
            updateCallToAction: function() {
                cta.innerHTML = (state) ? 'less' : 'more';
            },
            
            renderCount: function(count) {
                dom.appendChild(domCount);
                domCount.className = 'count';
                domCount.innerHTML = count; 
            },

            renderState: function(state) {
                dom.className = (state) ? 'open' : 'shut'; 
            },
            
            renderCallToAction: function() {
                bean.add(cta, 'click', function(e) {
                    common.mediator.emit('modules:expandable:cta:toggle:'+id);
                });
                dom.appendChild(cta);
                cta.className = 'cta';
                view.updateCallToAction();
            },
        }
        
        // Model

        var model = {
        
            toggleState: function(eventId) {
                state = (state) ? false : true;
                common.mediator.emit('modules:expandable:stateChange:'+id, state)
            },

            getCount: function() {
                return dom.getAttribute('data-count')
            }

        }

        // FIXME listen for 'modules:related:loaded' event instead
        this.load = function(){
            common.mediator.emit('modules:expandable:init:'+id) 
        } 

        var isOpen = function(){ 
            return (dom.className == 'open') ? true : false;
        }

        var initalise = function() {
            state = isOpen();
            view.renderCount(model.getCount()); 
            view.renderCallToAction(); 
        }
        
        // Bindings
        
        // init
        common.mediator.on('modules:expandable:init:'+id, initalise);

        // view listeners
        common.mediator.on('modules:expandable:stateChange:'+id, view.renderState);
        common.mediator.on('modules:expandable:stateChange:'+id, view.updateCallToAction);

        // model listeners
        common.mediator.on('modules:expandable:cta:toggle:'+id, model.toggleState);

    }

    return Expandable 
   
});

