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

    function Experiment(config, experimentName) {

        var that = this;

        this.init = function () {
            this.load('/experiment/' + experimentName + '/' + config.page.pageId);
        };

        // View
        this.view = {
            render: function (html) {
                document.getElementById('js-related').innerHTML = html;
                common.mediator.emit('modules:experiment:render');
                // Remove the existing story package and its title
                common.$g('#related-trails, h3.type-2.article-zone').remove();
            },
            fallback: function () {
                common.mediator.emit("modules:related:load");
            }
        };

        // Bindings
        common.mediator.on('modules:experiment:loaded', this.view.render);
        common.mediator.on('modules:experiment:render', function() {
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
    
    return Experiment;

});
