define(['common', 'vendor/bean-0.4.11-1'], function(common, bean){ 

    function Expandable(root) {

        var dom      = root, // root element of the trailblock
            state    = true, // true = open, false = closed
            cta      = document.createElement('div'),
            domCount = document.createElement('div'),
            count,
            that     = this;

        // View 
        
        this.view = {
           
            updateCallToAction: function() {
                cta.innerHTML = (state) ? 'more' : 'less';
            },

            renderCount: function(c) {
                dom.appendChild(domCount);
                domCount.innerHTML = 'hidden items : ' + c; 
            },

            renderState: function(state) {
                dom.className = (state) ? 'open' : 'shut'; 
            },
            
            renderCallToAction: function() {
                bean.add(cta, 'click', function(e) {
                    common.pubsub.emit('modules:expandable:cta:toggle');
                });
                dom.appendChild(cta);
            },

        
        }

        
        // Model

        this.model = {
        
            toggleState: function() {
                state = (state) ? false : true;
                common.pubsub.emit('modules:expandable:stateChange', state)
            },

            getCount: function() {
                return dom.getAttribute('data-count')
            }

        }

        // FIXME listen for dom:onload event instead
        this.load = function(){
            common.pubsub.emit('modules:expandable:init', this.model.getCount()) 
        }  

        // Bindings
        
        // init 
        common.pubsub.on('modules:expandable:init', this.view.renderCount);
        common.pubsub.on('modules:expandable:init', this.view.renderCallToAction);
        common.pubsub.on('modules:expandable:init', this.view.updateCallToAction);

        // view listeners
        common.pubsub.on('modules:expandable:stateChange', this.view.renderState);
        common.pubsub.on('modules:expandable:stateChange', this.view.updateCallToAction);

        // model listeners
        common.pubsub.on('modules:expandable:cta:toggle', this.model.toggleState);
        
    }

    return Expandable;

});

