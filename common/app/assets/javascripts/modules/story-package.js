define([
    'modules/expandable',
    'common',
    'reqwest'
], function (
    Expandable,
    common,
    reqwest,
    Pad
) {

    function StoryPackage(config, storyPackageName) {

        var that = this;

        this.init = function () {
            this.load('/story-package/' + storyPackageName + '/' + config.page.pageId);
        };

        // View
        this.view = {
            render: function (html) {
                common.$g('#related-trails, h3.type-2.article-zone').remove();
                document.getElementById('js-related').innerHTML = html;
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
                        that.view.render(json.html);
                    } else if (common.$g('#related-trails').length === 0) {
                        common.mediator.emit("modules:related:load");
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
