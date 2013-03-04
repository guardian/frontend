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
                // Remove the existing story package and its title
                common.$g('#related-trails, h3.type-2.article-zone').remove();

                // Add into article body
                var paras = common.$g('.article-body > p:not(:empty)');
                if (paras.length) {
                    // after last para
                    common.$g(paras[paras.length - 1]).after(html);
                    // after first para, minus accordion
                    var el = document.createElement('div');
                    common.$g(el).html(html);
                    common.$g('.accordion', el).remove();
                    common.$g(paras[0]).after(el);
                }
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
