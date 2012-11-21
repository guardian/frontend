define(['common', 'reqwest', 'bonzo'], function (common, Reqwest, bonzo) {

    function FootballTables(options) {
        var reqwest = Reqwest;

        this.path =  "/football/api/competitiontable?";
        this.queryString = "&competitionId=";

        // View
        this.view = {
            render: function (html) {
                var el = bonzo(options.prependTo).before(html);
                common.mediator.emit('modules:footballtables:render');
            }
        };
        
        // Model
        this.load = function (query) {
            var that = this;

            return reqwest({
                url: query,
                type: 'jsonp',
                jsonpCallback: 'callback',
                jsonpCallbackName: 'footballtables',
                success: function (response) {
                    //This is because the endpoint can also return a 204 no-content
                    if(response) {
                       that.view.render(response.html);
                    }
                },
                error: function () {
                    common.mediator.emit("modules:error", 'Failed to load football table', 'footballtables.js');
                }
            });
        };

        this.generateQuery = function() {
            var query = this.queryString,
                path = this.path,
                competition = options.competition;
            
            return path + query + competition;
        };

        //Initalise
        this.init = function(opts) {
            opts = opts || {};
            reqwest = opts.reqwest || Reqwest; //For unit testing

            var query = this.generateQuery();

            this.load(query);
        };

    }
    
    return FootballTables;

});