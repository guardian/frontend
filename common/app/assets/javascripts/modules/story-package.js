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
                document.getElementById('js-related').innerHTML = html;
                common.mediator.emit('modules:story-package:render');
                // Remove the existing story package and its title
                common.$g('#related-trails, h3.type-2.article-zone').remove();
            },
            fallback: function () {
                common.mediator.emit("modules:related:load");
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
                type: 'html',
                success: function (resp) {
                    // 200: resp = body as a string
                    // 404: resp = XHR object (the error callback isn't called, weirdly)
                    if (typeof resp === 'string') {
                        that.view.render(resp);
                    } else {
                        that.view.fallback();
                    }
                },
                error: function () {
                    that.view.fallback();
                }
            });
        };
    }
    
    return StoryPackage;

});
