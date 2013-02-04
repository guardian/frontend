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
        var path = '/story-package/tone-group',
            id = config.id;

        // View
        
        this.view = {
            render: function (response) {
                console.log(response);
                document.getElementById('js-story-package').innerHTML = response.html;
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
                    common.mediator.emit('modules:story-package:loaded', json);
                },
                error: function () {
                    common.mediator('module:error', 'Failed to load story-package', 'story-package.js');
                }
            });
        };
    }
    
    return StoryPackage;

});
