/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define([
    'common',
    'reqwest',
    'bonzo',
    'bean',
    'qwery'
], function (
    common,
    reqwest,
    bonzo,
    bean,
    qwery
) {
    
    /**
     * 
     */
    function TrailblockShowMore(options) {
        
        var opts = options || {},
            className = opts.className || 'js-show-more';

        // code to do with dom manipulation and user interaction goes in here
        this.view = {
                
           appendCta: function(trailblock) {  
               bonzo(trailblock).append('<span class="cta">Show more</span>');
           },
           
           removeCta: function(cta) {  
               bonzo(cta).remove();
           },
           
           render: function(cta, response) {
               // put the trails before the cta
               bonzo(cta).before(response.html);
               common.mediator.emit('module:trailblock-show-more:render');
           }
        
        };

        // initialise
        this.init = function() { 
            var trailblocks = common.$g('.' + className);
            // append the cta
            trailblocks.each(this.view.appendCta);
            var that = this;
            // event delegation for clicking of cta
            bean.on(qwery('#front-container')[0], 'click', '.trailblock .cta', function(e) {
                var cta = e.srcElement;
                // what's the section
                var section = bonzo(bonzo(cta).parent()).attr('id').replace('front-trailblock-', '')
                // what's the offset?
                var offset = qwery('.trail', bonzo(cta).parent()[0]).length;
                reqwest({
                    url: '/' + section + '?offset=' + offset,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'trails',
                    timeout: 5000,
                    success: function (response) {
                        common.mediator.emit('module:trailblock-show-more:loaded');
                        // if no response, remove cta
                        if (response) {
                            that.view.render(cta, response);                            
                        } else {
                            that.view.removeCta(cta);
                        }
                    },
                    error: function () {
                        common.mediator.emit(
                            'module:error', 'Failed to load more trails for:' + options.path, 'modules/trailblock-show-more.js'
                        );
                    }
                });
            });
        };
    }
    
    return TrailblockShowMore;

});
