define(['common', 'ajax'], function (common, ajax) {

    function Popular(attachTo) {

        // View

        this.view = {

            attachTo: attachTo,

            render: function (html) {
                attachTo.innerHTML = html;
                common.mediator.emit('modules:popular:render');
            }

        };

        // Model

        this.load = function (url) {
            var that = this;
            return ajax({
                    url: url,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'showMostPopular',
                    success: function (json) {
                        that.view.render(json.html);
                        common.mediator.emit('modules:popular:loaded', [json.html]);
                    },
                    error: function () {
                        common.mediator('module:error', 'Failed to load most popular', 'popular.js');
                    }
                });
        };

    }

    return Popular;

});
