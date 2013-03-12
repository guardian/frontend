define([
    'common',
    'ajax'
], function (
    common,
    ajax
) {

     function StoryType(config) {

        var path = "/stories/";

        this.types = [];

        this.types.analysis = function(data) {
            var el = document.querySelector('.story-content'),
                latest = document.querySelector('.story-latest');

            common.$g('figure',latest).remove();

            el.innerHTML = data;

            common.mediator.emit('module:storytype:loaded');
        };

        this.load = function(url) {
            var that = this;
            ajax({
                url: url,
                type: "jsonp",
                jsonpCallback: 'callback',
                jsonpCallbackName: 'storycontent',
                success: function(data) {
                    if(data && data.html) {
                        that.types[config.type](data.html);
                    }
                },
                error: function () {
                    common.mediator.emit('module:error', 'Failed to load story content', 'storytype.js');
                }
            });
        };

         this.init = function(){
             var url = path + config.id + '/' + config.type;
             this.load(url);
         };

    }

    return StoryType;

});