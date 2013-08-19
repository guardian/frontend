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

            render: function($cta, section) {
                // what's the offset?
                for (var i = 0; i < trailblockLength; i++) {
                    var trail = trails[section][i];
                    if (!trail) {
                        break;
                    }
                    bonzo($cta.previous()).append(trail);
                }
                // remove trails
                trails[section] = trails[section].slice(trailblockLength);
                common.mediator.emit('module:trailblock-show-more:render');
            },

           appendCta: function(trailblock) {
               bonzo(trailblock).append('<button class="cta trailblock-show-more" data-link-name="Show more | 1">Show more</button>');
           },

           removeCta: function($cta) {
               $cta.remove();
           },

           updateCta: function($cta) {
               var section = getSection($cta);
               if (trails[section] && trails[section].length === 0) {
                   this.removeCta($cta);
               } else {
                   // increase the show more count
                   var newDataLinkName = $cta.attr('data-link-name').replace(/^(.* | )(\d+)$/, function(match, prefix, count) {
                       // http://nicolaasmatthijs.blogspot.co.uk/2009/05/missing-radix-parameter.html
                       return prefix + (parseInt(count, 10) + 1);
                   });
                   $cta.attr('data-link-name', newDataLinkName);
               }
           }

        };

        function getSection($cta) {
            return bonzo($cta.parent()).attr('data-section-id') || 'top-stories';
        }

        // initialise
        this.init = function(context) {

            var that = this,
                trailblocks = common.$g('.' + className, context);

            if(! trailblocks.length) {
                return;
            }

            // Remove the class, so we can't do multiple inits
            trailblocks.each(function(trailblock){
                bonzo(trailblock).removeClass('js-show-more');
            });

            // append the cta
            trailblocks.each(this.view.appendCta);

            // event delegation for clicking of cta
            bean.on(context.querySelector('.front-container'), 'click', 'button.trailblock-show-more', function(e) {
                var $cta = bonzo(e.target),
                    // what's the section (default to 'top-stories')
                    section = getSection($cta);

                // have we already got the trails
                if (trails[section]) {
                    that.view.render($cta, section);
                } else {
                    $cta.attr('disabled', 'disabled');
                    ajax({
                        url: (opts.url || '/' +  section + '/trails') + '.json',
                        type: 'json',
                        crossOrigin: true
                    }).then(
                        function(resp) {
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

                            that.view.render($cta, section);
                            that.view.updateCta($cta);

                            // listen to the clickstream, as happens after this module
                            common.mediator.on('module:clickstream:click', function(clickSpec) {
                                var $cta = bonzo(clickSpec.target);
                                if ($cta.hasClass('trailblock-show-more')) {
                                    that.view.updateCta($cta);
                                }
                            });
                        },
                        function(req) {
                            common.mediator.emit('module:error', 'Failed to load more trailblocks: ' + req.statusText, 'modules/trailblock-show-more.js');
                        }
                    ).always(
                        function(resp) {
                            $cta.removeAttr('disabled');
                        }
                    );
                }
            });
        };
    }

    return TrailblockShowMore;

});
