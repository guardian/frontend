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

        var modules = {
            initAccordion: function () {
                if(document.querySelector('.accordion')) {
                    var a = new Accordion();
                }
            },

            initTimeline: function() {
                var $ = common.$g,
                    timeline = document.querySelector('.timeline'),
                    eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

                if(timeline) {
                    $('.event-children').addClass('h');
                    $('.event-children').first().removeClass('h');
                    bean.on(timeline, eventType, '.date-line', function(e) {
                        var block = $(this).parent();
                        $('.event-children', block).toggleClass('h');
                    });
                }
            },

            initExpandables: function() {
                var els = document.querySelectorAll('.expandable');

                for(var i = 0, l = els.length; i < l; i++) {
                    var id = els[i].id;
                    var e = new Expandable({id: id, expanded: false});
                    e.init();
                }
            }
        };

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
                var el;

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

                new Story.init({}, config);
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
