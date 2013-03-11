define([
    'common',
    'ajax'
], function (
    common,
    ajax
) {

    function Experiment() {

        var experimentName = localStorage.getItem('gu.experiment') || '',
            that = this;

        this.init = function (config) {
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
                switch (experimentName) {
                    case 'storymodule01':
                        this.renderStoryModule01(html);
                        break;
                    case 'storymodule02':
                        this.renderStoryModule02(html);
                        break;
                }
                common.mediator.emit('modules:experiment:render');
            },

            renderStoryModule01: function(html) {
                // Instead of main title
                var top = common.$g('h2.article-zone.type-1');
                var el = document.createElement('div');
                common.$g(el).html(html);
                top.html(common.$g('.story-package-title', el));

                // Add after last para
                var paras = common.$g('.article-body > p:not(:empty)');
                if (paras.length) {
                    common.$g(paras[paras.length - 1]).after(html);
                }

                // Remove the existing story package and its title
                common.$g('#related-trails, h3.type-2.article-zone').remove();
            },

            renderStoryModule02: function(html) {
                // Add into article body
                var paras = common.$g('.article-body > p:not(:empty)');
                if (paras.length) {
                    // after last para
                    common.$g(paras[paras.length - 1]).after(html);

                    // after first para, minus detail (eg. trailblock)
                    var el = document.createElement('div');
                    common.$g(el).html(html);
                    var bq = document.createElement('h2');
                    common.$g(bq).html(common.$g('.story-package-title', el));
                    common.$g(paras[1]).after(bq);
                }

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
