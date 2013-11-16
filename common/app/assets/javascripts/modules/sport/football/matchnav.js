define(['common', 'utils/ajax'], function (common, ajax) {

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
                type: 'json',
                crossOrigin: true
            }).then(
                function (json) {
                    if (json.status === 404) {
                        return;
                    }
                    that.view.render(json, context);
                    common.mediator.emit('modules:matchnav:loaded', json);
                },
                function(req) {
                    common.mediator.emit('modules:error', 'Failed to load match nav: ' + req.statusText, 'modules/matchnav.js');
                }
            );
        };
    }
    
    return MatchNav;

});
