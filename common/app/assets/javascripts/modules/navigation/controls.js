define(['common', 'vendor/bean-0.4.11-1'], function(common, Bean) { 

    var Tab = function(label) {
        var label = document.createElement('div'),
            state = true;
    }

    var Navigation = function(opts) {

        var toggles = [new Tab('Sections'), new Tab('Top Stories')];
       
        // View
        
        var view = {

            // FIXME hack
            toggle: function(state) {
                var d = common.$g('body');
                
                c = (d.hasClass(state)) ? true : false; 

                /* messy! */
                if (state === 'active-left' &! c) {
                    d.addClass('active-left');
                    d.removeClass('active-right');
                    //common.$g('#sections-control').html('&raquo; Sections')
                    }

                if (state === 'active-left' && c) {
                    d.addClass('was-active-left');
                    d.removeClass('active-left');
                    //common.$g('#sections-control').html('Sections')
                    }
                
                if (state === 'active-right' &! c) {
                    d.addClass('active-right');
                    d.removeClass('active-left');
                    }
                
                if (state === 'active-right' && c) {
                    d.removeClass('active-right');
                    }
                
                return (state)
            },

            transponseSections: function () {
                var placeholder = common.$g('#sections-container');
                placeholder.append(common.$g('#sections'));
            },

            init: function() {

                view.transponseSections();
                    
                Bean.add(document.getElementById('sections-control'), 'click', function(e) {
                    view.toggle('active-left')
                    e.preventDefault();
                });
                
                Bean.add(document.getElementById('topstories-control'), 'click', function(e) {
                    view.toggle('active-right');
                    e.preventDefault();
                });

            }
                    
        }

        // Model

        var model = {
        }
        
        this.initialise = function() {
            view.init()
        }
    }


    return Navigation 
   
});

