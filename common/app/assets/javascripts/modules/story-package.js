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
        var that = this,
            showPrototypes = Math.random() > 0.5,
            numPackages = 2, 
            id = config.page.pageId
            prototypeUrl,
            relatedUrl;


        this.init = function (){
            var package, 
                path;

            if (showPrototypes) {
                package = parseInt(common.queryParams.package, 10) || 0;
                package = package || Math.floor(1 + Math.random()*numPackages);
                prototypeUrl = '/story-package/version/' + package;
            } else if (config.page.showInRelated) {
                relatedUrl = config.page.coreNavigationUrl + '/related/' + config.page.pageId;
            }
        };

        this.loadPrototype = function (path){
            common.mediator.on('modules:story-package:failed', function(){
                that.loadRelated(relatedUrl);
            });
            this.load(prototypeUrl);
        }

        this.loadRelated = function (){
            this.load(relatedUrl);
        }

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

        this.load = function (path) {
            var url = path;
            reqwest({
                url: url,
                success: function (json) {
                    if (json.html !== '') {
                        common.mediator.emit('modules:story-package:loaded', json);
                    } else {
                        common.mediator.emit('modules:story-package:failed');
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
