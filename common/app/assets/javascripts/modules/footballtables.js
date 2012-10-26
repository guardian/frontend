define(['common'], function (common) {

    function FootballTables(attachTo, list) {

        this.competitions = ['100'];
        this.path =  "/football/api/frontscores&";
        this.queryString = "competitionId";

        // View
        this.view = {
            attachTo: this.attachTo,

            render: function (html) {
                attachTo.innerHTML = html;
                common.mediator.emit('modules:footballtables:render');
            }
        };
        
        // Model
        this.load = function (url) {
            var path = this.path,
                that = this;

            return reqwest({
                url: path,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'footballtables',
                success: function (response) {
                    if(response.html) {
                        common.mediator.emit('modules:footballtables:loaded', [response.html]);
                    }
                },
                error: function () {
                    common.mediator.emit("modules:error", 'Failed to load football table', 'footballtables.js', '35');
                }
            });
        };

        // Bindings
        common.mediator.on('modules:footballtables:loaded', this.view.render);

        //Initalise
        this.init = function () {
            var query = this.path;

            for(var i =0, j = list.length; i < j; i++) {
                query += this.queryString + list[i];
            }

            this.load(query);
        };

    }
    
    return FootballTables;

});