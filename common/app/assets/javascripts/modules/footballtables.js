define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {

    function FootballTables(options) {

        this.path =  "/football/api/competitiontable?";
        this.queryString = "&competitionId=";

        // View
        this.view = {
            render: function (html) {
                bonzo(options.prependTo).before(html);
                common.mediator.emit('modules:footballtables:render');
            }
        };
        
        // Model
        this.load = function (query) {
            var that = this;

            return ajax({
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
            ajax = opts.ajax || ajax; //For unit testing

            var query = (options.path) ? options.path : this.generateQuery();

            this.load(query);
        };

    }
    
    return FootballTables;

});