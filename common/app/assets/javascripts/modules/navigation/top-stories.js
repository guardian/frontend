define(['common', 'reqwest', 'bonzo'], function (common, reqwest, bonzo) {

    function Navigation() {
        
        // View
        
        this.view = {
        
            render: function (html) {
                var topstoriesHeader, topstoriesFooter, topstoriesNav, i, l, elm;

                topstoriesHeader = document.getElementById('topstories-header');
                topstoriesNav = common.$g('.topstories-control');

                topstoriesHeader.innerHTML = html;

                //  show the initially-hidden top stories nav link
                for (i = 0, l = topstoriesNav.length; i < l; i++) {
                    elm = topstoriesNav[i];
                    bonzo(elm).removeClass('initially-off');
                }

                common.mediator.emit('modules:navigation:render');
            }
        
        };

        // Bindings
        
        common.mediator.on('modules:navigation:loaded', this.view.render);
        
        // Model
        
        this.load = function (config) {
            var latestUrl = config.page.coreNavigationUrl + '/top-stories';
            
            return reqwest({
                    url: latestUrl,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'navigation',
                    success: function (json) {
                        common.mediator.emit('modules:navigation:loaded', [json.html]);
                    }
                });
        };

    }
    
    return Navigation;

});
