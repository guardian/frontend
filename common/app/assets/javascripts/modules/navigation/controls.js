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
            toggle: function(state, position) {

                var item = ((state == "sections") ? ".sections-" + position : "#topstories-" + position + " .topstories");
                var altitem = ((state == "sections") ?  "#topstories-" + position + " .topstories" : ".sections-" + position);

                console.log(item + ", " + altitem);

                var call = common.$g(item);
                var altcall = common.$g(altitem);


                var timeout = 0;

                if(common.$g(altcall).hasClass("open"))
                {
                    //If the other box is open, close that first and wait 1 second before opening the next
                    //common.$g(altcall).removeClass("shadow");
                    common.$g(altcall).toggleClass("transition-short transition-long open");
                    var timeout = 0;
                }

                setTimeout(function(){
                    //Open the clicked box, then when it's opened, get it's height and set it to the max-height
                    common.$g(call).toggleClass("transition-short transition-long open");
                    /*setTimeout(function(){
                        common.$g(call).toggleClass("shadow");
                    }, 1000);*/
                }, timeout);

                /* messy! */
                //c = (d.hasClass(state)) ? true : false; 
                /*
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
                */
            
                return (state)
            },

            transponseSections: function () {
                var placeholder = common.$g('#sections-container');
                placeholder.append(common.$g('#sections'));
            },

            init: function() {

                //view.transponseSections();

                Bean.add(document.getElementById('sections-control-header'), 'click', function(e) {
                    view.toggle('sections', 'header');
                    e.preventDefault();
                });

                Bean.add(document.getElementById('sections-control-footer'), 'click', function(e) {
                    view.toggle('sections', 'footer');
                    e.preventDefault();
                });
                
                Bean.add(document.getElementById('topstories-control-header'), 'click', function(e) {
                    view.toggle('topstories', 'header');
                    e.preventDefault();
                });

                Bean.add(document.getElementById('topstories-control-footer'), 'click', function(e) {
                    view.toggle('topstories', 'footer');
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

