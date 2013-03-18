define([
    "common",
    "bean",
    "ajax",

    "modules/accordion",
    "modules/expandable",
    "bootstraps/story"
], function(
    common,
    bean,
    ajax,

    Accordion,
    Expandable,
    Story
) {

    function Experiment(config) {

        var experimentName = localStorage.getItem('gu.experiment') || '',
            that = this;

        this.init = function () {
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
            render: function (json) {
                switch (experimentName) {
                    case 'storymodule01':
                        this.renderStoryModule01(json);
                        break;
                    case 'somethingElse':
                        break;
                }
                common.mediator.emit('modules:experiment:render');
            },

            renderStoryModule01: function(json) {
                var el, story;

                document.querySelector('h2.article-zone.type-1').innerHTML = json.title;
                document.querySelector('#js-related').innerHTML = json.block;
                
                el = document.querySelector('#related-trails');
                if (el) {
                    el.parentNode.removeChild(el);
                }

                el = document.querySelector('h3.type-2.article-zone');
                if (el) {
                    el.parentNode.removeChild(el);
                }

                story = new Story.init({}, config);
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
                    if (json && json.title && json.block) {
                        that.view.render(json);
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
