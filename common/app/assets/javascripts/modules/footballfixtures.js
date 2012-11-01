define(['common', 'reqwest', 'bonzo'], function (common, reqwest, bonzo) {

    function FootballFixtures(options) {
        //Full list of competitions from CM, in priority order.
        this.competitions = ['500', '510', '100', '101', '120', '127', '301', '213', '320', '701', '650', '102', '103', '121', '122', '123'];

        this.path =  "/football/api/frontscores?";
        this.queryString = "&competitionId=";

        // View
        this.view = {
            render: function (html) {
                var el = bonzo(options.prependTo).after(html);
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
        common.mediator.on('modules:footballtables:loaded', this.view.render, this);
        common.mediator.on('modules:footballtables:render', function() {
            if(options.expandable) {
                common.mediator.emit('modules:footballtables:expand' ,'front-competition-table');
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
        this.init = function () {
            var query = this.generateQuery();

            this.load(query);
        };

    }
    
    return FootballFixtures;

});