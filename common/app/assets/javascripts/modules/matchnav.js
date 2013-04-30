define(['common', 'ajax', 'modules/pad'], function (common, ajax, Pad) {

    function MatchNav() {

        // View
        
        this.view = {
            render: function (json, context) {
                context.querySelector(".after-header").innerHTML = json.nav;
                if (json.related) {
                    context.querySelector(".js-related").innerHTML = json.related;
                }

                common.mediator.emit('modules:matchnav:render');
            }
        };
        
        this.load = function (url, context) {
            var that = this;
            ajax({
                url: url,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showMatchNav',
                success: function (json) {
                    if (!json) {
                        common.mediator.emit('module:error', 'Failed to load match nav', 'matchnav.js');
                        return;
                    }
                    if (json.status === 404) {
                        return;
                    }
                    that.view.render(json, context);
                    common.mediator.emit('modules:matchnav:loaded', json);
                }
            });
        };
    }
    
    return MatchNav;

});
