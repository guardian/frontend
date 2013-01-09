define(['common', 'reqwest', 'modules/pad'], function (common, reqwest, Pad) {

    function MatchNav() {

        // View
        
        this.view = {
            render: function (json) {
                document.querySelector(".after-header").innerHTML = json.nav;
                if (json.related) {
                    document.querySelector("#js-related").innerHTML = json.related;
                }

                common.mediator.emit('modules:matchnav:render');
            }
        };

        // Bindings
        common.mediator.on('modules:matchnav:loaded', this.view.render);
        
        this.load = function (url) {
            reqwest({
                url: url,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'showMatchNav',
                success: function (json) {
                    common.mediator.emit('modules:matchnav:loaded', json);
                },
                error: function () {
                    common.mediator('module:error', 'Failed to load match nav', 'matchnav.js');
                }
            });
        };
    }
    
    return MatchNav;

});
