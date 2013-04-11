define(['common', 'ajax'], function (common, ajax) {

    function Related(attachTo, switches) {
        
        // View
        this.view = {
            attachTo: attachTo,
            render: function (html) {
                attachTo.innerHTML = html;
                common.mediator.emit('modules:related:render');
            }
        };
        
        // Model
        this.load = function (url) {
            var that = this;
            if (switches.relatedContent) {
                return ajax({
                    url: url,
                    type: 'jsonp',
                    jsonpCallback: 'callback',
                    jsonpCallbackName: 'showRelated',
                    success: function (json) {
                        that.view.render(json.html);
                        common.mediator.emit('modules:related:loaded', [json.html]);
                    },
                    error: function () {
                        common.mediator('module:error', 'Failed to load related', 'related.js');
                    }
                });
            }
        };

    }
    
    return Related;

});
