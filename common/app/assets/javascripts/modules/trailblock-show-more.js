/*
    Module: trailblock-show-more.js
    Description: Pull in more trailblocks dynamically
*/
define(['common', 'ajax', 'bonzo', 'bean', 'qwery'], function (common, ajax, bonzo, bean, qwery) {

    function TrailblockShowMore(options) {
        
        var opts = options || {},
            className = opts.className || 'js-show-more',
            trails = {},
            trailblockLength = 5;

        // code to do with dom manipulation and user interaction goes in here
        this.view = {
                
           appendCta: function(trailblock) {
               bonzo(trailblock).append('<button class="cta" data-link-name="Show more | 1">Show more</button>');
           },
           
           removeCta: function($cta) {
               $cta.remove();
           },
           
           render: function($cta, section) {
               // what's the offset?
               for (var i = 0; i < trailblockLength; i++) {
                   var trail = trails[section][i];
                   if (!trail) {
                       this.removeCta($cta);
                       break;
                   }                   
                   bonzo($cta.previous()).append(trail);
               }
               // remove trails
               trails[section] = trails[section].slice(trailblockLength); 
               common.mediator.emit('module:trailblock-show-more:render');
           }
        
        };

        // initialise
        this.init = function() {
            var that = this,
                trailblocks = common.$g('.' + className)
                    // append the cta
                    .each(this.view.appendCta);
            
            // event delegation for clicking of cta
            bean.on(qwery('#front-container')[0], 'click', '.trailblock button.cta', function(e) {
                var $cta = bonzo(e.target),
                    // what's the section (default to 'top-stories')
                    section = bonzo($cta.parent()).attr('data-section-id') || 'top-stories';
                
                function updateTrailblock($cta, section) {
                    that.view.render($cta, section);
                    
                    // increase the show more count
                    var newDataLinkName = $cta.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                        // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                        return prefix + (parseInt(count, 10) + 1);
                    });
                    $cta.attr('data-link-name', newDataLinkName);
                }
                
                // have we already got the trails
                if (trails[section]) {
                    updateTrailblock($cta, section);
                } else {
                    ajax({
                        url: opts.url || '/' +  section + '/trails',
                        type: 'jsonp',
                        jsonpCallbackName: opts.jsonpCallbackName,
                        success: function (resp) {
                            common.mediator.emit('module:trailblock-show-more:loaded');
                            var $trailList = bonzo(bonzo.create(resp.html)),
                                $trails = common.$g('li', $trailList),
                                numTrails = common.$g('.trail', $cta.previous()).length;
                            // store trails
                            trails[section] = [];
                            // de-dupe
                            $trails.each(function(trail) {
                                // get the href for this trail
                                var href = common.$g('h2 a', trail).attr('href');
                                // only add if we don't already have this trail (based on href)
                                if (common.$g('.trail h2 a[href="' + href + '"]', $cta.previous()).length === 0) {
                                    // correct omniture count
                                    common.$g('h2 a', trail).attr('data-link-name', ++numTrails);
                                    trails[section].push(trail);
                                }
                            });
                            
                            updateTrailblock($cta, section);
                        }
                    });
                }
                
            });
        };
    }
    
    return TrailblockShowMore;

});
