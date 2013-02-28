define([
    'common',
    'ajax'
], function (
    common,
    ajax
) {

    function Experiment() {

        var that = this;

        this.init = function (config) {
            var experimentName = localStorage.getItem('gu.experiment') || '',
                experiment;

            if (!experimentName) {
                for (var key in config.switches) {
                    if (config.switches[key] && key.match(/^experiment(\w+)/)) {
                        experimentName = key.match(/^experiment(\w+)/)[1];
                        break;
                    }
                }
            }

            experimentName = experimentName.toLowerCase();

            if (experimentName) {
                this.load('/stories/' + experimentName + '/' + config.page.pageId);
            } else {
                common.mediator.emit("modules:related:load");
            }
        };

        // View
        this.view = {
            render: function (html) {
                common.$g('#related-trails, h3.type-2.article-zone').remove();
                document.getElementById('js-related').innerHTML = html;
                common.mediator.emit('modules:experiment:render');
                // Remove the existing story package and its title

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
                    if (json && json.html) {
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
