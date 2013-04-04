/*
    Module: continue-reading.js
    Description: Load in data from the linked page and display inline
*/
define(['common', 'ajax', 'bean', 'bonzo'], function (common, ajax, bean, bonzo) {

    function ContinueReading(element, options) {
        
        var $el = bonzo(element),
            opts = options || {},
            hidden = true,
            text = {
                show: 'Continue reading...',
                hide: 'Hide article'
            },
            $story,
            toggleStory = function() {
                var linkText = text[hidden ? 'hide' : 'show'];
                $el.text(linkText)
                    .attr('data-link-name', linkText);
                $story[hidden ? 'show' : 'hide']();
                hidden = !hidden;
            };

        // initialise
        this.init = function() {
            bean.on($el[0], 'click', function(e) {
                e.preventDefault();
                // if it's already showing, just hide
                if (!hidden) {
                    toggleStory();
                } else {
                    // if we've already made the request, just show
                    if ($story) {
                        toggleStory();
                    } else {
                        var href = $el.attr('href');
                        // make request to endpoint
                        ajax({
                            url: href + '.json',
                            type: 'jsonp',
                            jsonpCallback: 'callback',
                            success: function(resp) {
                                // skip first n paras
                                var skip = $el.attr('data-skip-paras'),
                                    re = new RegExp('^(<p>[^<]*<\/p>\\s*){' + skip + '}'),
                                    // assuming the link is in a 'p'
                                    $p = bonzo($el.parent());
                                $story = bonzo($p.after('<div>' + resp.html.replace(re, '') + '</div>').next());
                                toggleStory();
                            }
                        });
                    }
                }
            });
        };
        
    }
    
    return ContinueReading;

});
