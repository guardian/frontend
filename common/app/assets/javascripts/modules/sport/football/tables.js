define(['common', 'utils/ajax', 'bonzo'], function (common, ajax, bonzo) {

    function FootballTables(options) {

        this.path =  "/football/api/competitiontable.json?";
        this.queryString = "&competitionId=";

        // View
        this.view = {
            render: function (html) {
                bonzo(options.prependTo)[options.attachMethod || 'before'](html);
                common.mediator.emit('modules:footballtables:render');
            }
        };

        // Model
        this.load = function (query) {
            var that = this;
            return ajax({
                url: query,
                type: 'json',
                crossOrigin: true
            }).then(
                function (response) {
                    //This is because the endpoint can also return a 204 no-content
                    if(response) {
                       that.view.render(response.html);
                    }
                },
                function (req) {
                    common.mediator.emit('modules:error', 'Failed to load football table: ' + req.statusText, 'modules/footballtables.js');
                }
            );
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
