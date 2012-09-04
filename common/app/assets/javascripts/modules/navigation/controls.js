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
               
                console.log(c);

                if (state === 'active-left' &! c) {
                    d.addClass('active-left');
                    d.removeClass('active-right');
                    //common.$g('#sections-control').html('&raquo; Sections')
                    }

                if (state === 'active-left' && c) {
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
                var placeholder = common.$g('#offcanvas-sections');
                placeholder.append(common.$g('#sections'));
            },

            init: function() {

                view.transponseSections();
                    
                Bean.add(document.getElementById('sections-control'), 'click', function(e) {
                    view.toggle('active-left')
                    e.preventDefault()
                });
                
                Bean.add(document.getElementById('topstories-control'), 'click', function() {
                    view.toggle('active-right')
                });

                console.log(model.hasKeyframeSupport());

                // tab Vs. slidable panel
                if (model.hasKeyframeSupport()) { 
                    common.$g('body').addClass('webkit-keyframes');
                }

            }
                    
        }

        
        // Model

        var model = {

            hasKeyframeSupport: function(){

                var animation = false,
                    animationstring = 'animation',
                    keyframeprefix = '',
                    domPrefixes = 'Webkit'.split(' '),
                    pfx  = '',
                    elm = document.createElement('div');
 
                if( elm.style.animationName ) { animation = true; }    
 
                if( animation === false ) {
                    for( var i = 0; i < domPrefixes.length; i++ ) {
                        if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
                            pfx = domPrefixes[ i ];
                            animationstring = pfx + 'Animation';
                            keyframeprefix = '-' + pfx.toLowerCase() + '-';
                            animation = true;
                            break;
                        }
                    }
                }

                return (animation)
            }
        }
        
        this.initialise = function() {
            view.init()
        }
    }


    return Navigation 
   
});

