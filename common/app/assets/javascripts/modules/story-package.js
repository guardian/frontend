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
        var numPackages = 1,
            relatedUrl = config.page.coreNavigationUrl + '/related/' + config.page.pageId,
            that = this;

        this.init = function () {
            var packageName;

            for (var key in config.switches) {
                storyPackageName = key.match(/storytelling(\w+)/) 
                if (storyPackageName && config.switches[key]) {
                    storyPackageName = storyPackageName[1];
                    break;
                }
            }

            // Allow a ?package=... query str override
            storyPackageName = common.queryParams.package || storyPackageName;

            if (storyPackageName) {
                common.mediator.on('modules:story-package:failed', function(){
                    that.loadRelated(relatedUrl); // There's no story package, so load related
                });
                this.load('/story-package/version/' + storyPackageName + '/' + config.page.pageId);
            } else {
                this.load(relatedUrl);
            }
        };

        this.loadRelated = function () {
            if (config.page.showInRelated) {
                this.load(relatedUrl);
            }
        };

        // View
        this.view = {
            render: function (html) {
                common.$g('#related-trails, h3.type-2.article-zone').remove();
                document.getElementById('story-package').innerHTML = html;
                common.mediator.emit('modules:story-package:render');
            }
        };

        // Bindings
        common.mediator.on('modules:story-package:loaded', this.view.render);
        common.mediator.on('modules:story-package:render', function() {
            common.mediator.emit('modules:tabs:render');
        });

        this.load = function (url) {
            reqwest({
                url: url,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'lazyLoad',
                success: function (json) {
                    if (json.html !== '') {
                        common.mediator.emit('modules:story-package:loaded', [json.html]);
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
