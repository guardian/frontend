define(['common', 'reqwest', 'bonzo'], function (common, reqwest, bonzo) {

    function FootballTables(prependTo, competition) {

        this.competitions = ['500', '510', '100', '101', '120', '127', '301', '213', '320', '701', '650', '102', '103', '121', '122', '123'];
        this.path =  "/football/api/frontscores?";
        this.queryString = "&competitionId=";


        // View
        this.view = {
            prependTo: this.prependTo,
            render: function (html) {
                bonzo(prependTo).after(html);
                common.mediator.emit('modules:footballtables:render');
            }
        };
        
        // Model
        this.load = function (query) {
            var path = this.path + query,
                that = this;

            return reqwest({
                url: path,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'footballtables',
                success: function (response) {
                    if(response.html) {
                        common.mediator.emit('modules:footballtables:loaded', response.html);
                    }
                },
                error: function () {
                    common.mediator.emit("modules:error", 'Failed to load football table', 'footballtables.js', '35');
                }
            });
        };

        // Bindings
        common.mediator.on('modules:footballtables:loaded', this.view.render);

        this.generateQuery = function() {
            var query = this.queryString;

            switch(typeof competition) {
                case 'string' :
                    query += competition;
                    break;
                case 'array' :
                    query += competition.join(this.queryString);
                    break;
                default :
                    query += this.competitions.join(this.queryString);
                    break;
            }

            return query;
        };

        //Initalise
        this.init = function () {
            var query = this.generateQuery();

            this.load(query);
        };

    }
    
    return FootballTables;

});