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
                show: 'Continue reading',
                hide: 'Hide'
            },
            $story,
            toggleStory = function() {
                var linkText = text[hidden ? 'hide' : 'show'];
                element.querySelector('.cta-new__text').innerHTML = linkText;
                $el.attr('data-link-name', linkText);
                $el.toggleClass('is-open');
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
                                var skip = parseInt($el.attr('data-skip-paras'), 10) + 1,
                                    // assuming the link is in a 'p'
                                    $p = bonzo($el.parent()),
                                    $content = bonzo(bonzo.create(resp.html))[1],
                                    children = $content.querySelectorAll('.article-body > *');
                                // only skip <p>s
                                for (var i = 0; i < children.length; i++) {
                                    if (children[i].nodeName.toLowerCase() === 'p') {
                                        skip--;
                                    }
                                    if (skip === 0) {
                                        $story = bonzo([].slice.call(children, i));
                                        break;
                                    }
                                }
                                
                                bonzo($p.previous()).append($story);
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
