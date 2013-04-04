/*
    Module: continue-reading.js
    Description: Load in data from the linked page and display inline
*/
define(['common', 'ajax', 'bean', 'bonzo'], function (common, ajax, bean, bonzo) {

    function ContinueReading(element, options) {
        
        var $el = bonzo(element),
            opts = options || {},
            reqwesting = false;

        // initialise
        this.init = function() {
            bean.on($el[0], 'click', function(e) {
                e.preventDefault();
                if (reqwesting) {
                    return;
                }
                reqwesting = true;
                var href = $el.attr('href');
                // make request to endpoint
                ajax({
                    url: href + '.json',
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    success: function(resp) {
                        // skip first n paras
                        var skip = $el.attr('data-skip-paras'),
                            re = new RegExp('^(<p>[^<]*<\/p>\\s*){' + skip + '}');
                        $el.before(resp.html.replace(re, ''))
                            // remove the link
                            .remove();
                    },
                    // TODO: doesn't work, using jsonp
                    error: function(error) {
                        common.mediator.trigger('module:error', ['Unable to continue reading "' + href + '"', 'modules/story/continue-reading.js', 35]);
                        // redirect to article
                        // NOTE: need to wait a few milliseconds to make sure error beacon is called
                        setTimeout(function() {
                            window.location = href;
                        }, 400);
                    }
                });
            });
        };
        
    }
    
    return ContinueReading;

});
