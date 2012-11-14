define(['common', 'reqwest', 'bonzo'], function (common, Reqwest, bonzo) {

    function FootballFixtures(options) {
        var reqwest = Reqwest;

        //Full list of competitions from CM, in priority order.
        //Mappings can be found here: http://cms.guprod.gnl/tools/mappings/pafootballtournament
        this.competitions = ['500', '510', '100', '101', '120', '127', '301', '213', '320', '701', '650', '102', '103', '121', '122', '123'];

        this.path =  "/football/api/frontscores?";
        this.queryString = "&competitionId=";

        // View
        this.view = {
            render: function (html) {
                var el = bonzo(options.prependTo).after(html);
                common.mediator.emit('modules:footballfixtures:render');
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
                jsonpCallbackName: 'footballfixtures',
                success: function (response) {
                    //This is because the endpoint can also return a 204 no-content
                    if(response) {
                       that.view.render(response.html);
                    }
                },
                error: function () {
                    common.mediator.emit("modules:error", 'Failed to load football fixtures', 'footballfixtures.js');
                }
            });
        };

        // Bindings
        common.mediator.on('modules:footballfixtures:render', function() {
            if(options.expandable) {
                common.mediator.emit('modules:footballfixtures:expand', 'front-competition-table');
            }
        }, this);

        this.generateQuery = function() {
            var query = this.queryString,
                competitions = options.competitions;

            if(options.competitions) {
                query += (competitions.length > 1) ? competitions.join(this.queryString) : competitions[0];
            } else {
                query += this.competitions.join(this.queryString);
            }

            return query;
        };

        //Initalise
        this.init = function(opts) {
            opts = opts || {};
            reqwest = opts.reqwest || Reqwest; //For unit testing

            var query = this.generateQuery();

            this.load(query);
        };

    }
    
    return FootballFixtures;

});