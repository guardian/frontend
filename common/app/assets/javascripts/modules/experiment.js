define([
    'common',
    'ajax'
], function (
    common,
    ajax
) {

    function Experiment(config, experimentName) {

        var that = this;

        this.init = function () {
            this.load('/stories/' + experimentName + '/' + config.page.pageId);
        };

        // View
        this.view = {
            render: function (html) {
                // Remove the existing story package and its title
                common.$g('#related-trails, h3.type-2.article-zone').remove();

                //document.getElementById('js-related').innerHTML = html;
                var articleTop = common.$g('.article-zone.type-1');
                articleTop.after(html);
                articleTop.remove();

                common.mediator.emit('modules:experiment:render');

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
            return ajax({
                url: url,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showExperiment',
                success: function (json) {
                    if (json.html) {
                        that.view.render(json.html);
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
