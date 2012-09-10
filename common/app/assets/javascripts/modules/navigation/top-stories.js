define(['common', 'reqwest', 'bonzo'], function(common, reqwest, bonzo){ 

    function Navigation() {
        
        // View 
        
        this.view = {
        
            render: function(html) {
                var topstoriesHeader = document.getElementById('topstories-header');
                var topstoriesFooter = document.getElementById('topstories-footer');
                var topstoriesNav = common.$g('.topstories-control, .sections-control');

                topstoriesHeader.innerHTML = html;
                topstoriesFooter.innerHTML = html;

                // show the initially-hidden top stories nav link
                for (var i=0, l=topstoriesNav.length; i<l; i++) {
                    var elm = topstoriesNav[i];
                    bonzo(elm).removeClass('initially-off');
                }

                common.mediator.emit('modules:navigation:render')
            }
        
        }

        // Bindings
        
        common.mediator.on('modules:navigation:loaded', this.view.render);
        
        // Model
        
        this.load = function(config){
            var latestUrl = config.page.coreNavigationUrl + '/top-stories/' + config.page.edition;
            
            return reqwest({
                    url: latestUrl,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'navigation',
                    success: function(json) {
                        common.mediator.emit('modules:navigation:loaded', [json.html])
                    }
            })
        }  

    }
    
    return Navigation;

});
