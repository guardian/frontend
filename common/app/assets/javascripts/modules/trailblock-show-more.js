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
               bonzo(trailblock).append('<button class="cta">Show more</button>');
           },
           
           removeCta: function(cta) {  
               cta.remove();
           },
           
           render: function(cta, response) {
               // put the trails before the cta
               cta.before(response.html);
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
                var cta = bonzo(e.srcElement);
                // disable button
                cta.attr('disabled', 'disabled');
                // what's the section
                var section = bonzo(cta.parent()).attr('id').replace('front-trailblock-', '');
                // what's the offset?
                var offset = qwery('.trail', cta.parent()[0]).length;
                reqwest({
                    url: '/' + section + '?offset=' + offset,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'trails',
                    success: function (response) {
                        common.mediator.emit('module:trailblock-show-more:loaded');
                        that.view.render(cta, response);
                        // if no more, remove cta
                        if (!response.hasMore) {
                            that.view.removeCta(cta);
                        }
                    },
                    error: function () {
                        common.mediator.emit(
                            'module:error', 'Failed to load more trails for `' + section + '`', 'modules/trailblock-show-more.js'
                        );
                    },
                    complete: function() {
                        cta.removeAttr('disabled');
                    }
                });
            });
        };
    }
    
    return TrailblockShowMore;

});
