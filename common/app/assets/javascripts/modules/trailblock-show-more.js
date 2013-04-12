/*
    Module: autoupdate.js
    Description: Used to load update fragments of the DOM from specfied endpoint
*/
define(['common', 'ajax', 'bonzo', 'bean', 'qwery'], function (common, ajax, bonzo, bean, qwery) {

    function TrailblockShowMore(options) {
        
        var opts = options || {},
            className = opts.className || 'js-show-more';

        // code to do with dom manipulation and user interaction goes in here
        this.view = {
                
           appendCta: function(trailblock) {
               bonzo(trailblock).append('<button class="cta" data-link-name="Show more | 1">Show more</button>');
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
            var that = this,
                trailblocks = common.$g('.' + className)
                    // append the cta
                    .each(this.view.appendCta);
            // event delegation for clicking of cta
            
            bean.on(qwery('#front-container')[0], 'click', '.trailblock button.cta', function(e) {
                var cta = bonzo(e.target)
                        // disable button
                        .attr('disabled', 'disabled'),
                    // what's the section (default to 'top-stories')
                    section = bonzo(cta.parent()).attr('data-section-id') || 'top-stories',
                    // what's the offset?
                    offset = qwery('.trail', cta.parent()[0]).length;
                
                ajax({
                    url: '/' + section + '/trails',
                    type: 'jsonp',
                    success: function (resp) {
                        common.mediator.emit('module:trailblock-show-more:loaded');
                        that.view.render(cta, resp);
                        // if no more, remove cta
                        if (!resp.hasMore) {
                            that.view.removeCta(cta);
                        } else {
                            // otherwise, increase the show more count
                            var newDataLinkName = cta.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                                // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                                return prefix + (parseInt(count, 10) + 1);
                            });
                            cta.attr('data-link-name', newDataLinkName)
                                .removeAttr('disabled');
                        }
                    }
                });
            });
        };
    }
    
    return TrailblockShowMore;

});
