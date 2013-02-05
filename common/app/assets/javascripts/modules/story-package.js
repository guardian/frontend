define([
    'common',
    'reqwest'
], function (
    common,
    reqwest,
    Pad
) {

    function StoryPackage(config) {
        //Config
        var numPackages = 2, 
            package = parseInt(common.queryParams.package, 10) || 0;
            path = '/story-package/version/' + package,
            id = config.page.pageId;

        package = package || Math.floor(1 + Math.random()*numPackages);

        // View        
        this.view = {
            render: function (response) {
                console.log(response);
                document.getElementById('story-package').innerHTML = response.html;
                common.mediator.emit('modules:story-package:render');
            }
        };

        // Bindings
        common.mediator.on('modules:story-package:loaded', this.view.render);
        common.mediator.on('modules:story-package:render', function() {
            common.mediator.emit('modules:tabs:render');
        });

        this.load = function () {
            var url = path + id;
            reqwest({
                url: url,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'StoryPackage',
                success: function (json) {
                    if (json.html !== '') {
                        common.mediator.emit('modules:story-package:loaded', json);
                    } else {
                        
                    }
                },
                error: function () {
                    common.mediator('module:error', 'Failed to load story-package', 'story-package.js');
                }
            });
        };
    }
    
    return StoryPackage;

});
