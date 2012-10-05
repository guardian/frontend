define(['common', 'reqwest'], function (common, reqwest) {

    var Adverts = function (url) {

        this.url = url;

        // View
        this.view = {
            render: function (attachTo, html) {
                attachTo.innerHTML = html;
                common.mediator.emit('modules:adverts:render');
            }
        };

        // Bindings
        common.mediator.on('modules:related:adverts', this.view.render);

        //Data
        this.load = function() {

            reqwest({
                url: this.url,
                type: 'jsonp',
                jsonpCallback: 'test',
                success: function (resp) {
                    common.mediator.emit('modules:adverts:loaded', resp);
                },
                error: function (resp) {
                    common.mediator.emit('modules:adverts:error', resp);
                }
            });

        };
    };
    
    return Adverts;
});
