/*
    Module: footballfixtures.js
    Description: Used to load a list of football fixtures of a given competition and append to DOM
*/
define(['common', 'ajax', 'bonzo'], function (common, ajax, bonzo) {
    /*
        @param {Object} options hash of configuration options:
            prependTo   : {DOMElement}  DOM element to prepend component to
            competitions: {Array}       Ordered list of competetions to query
            path        : {String}      Used to overide endpoint path
            contextual  : {Boolean}     Whether or not component links should be contextual
            numVisible  : {Number}  Number of items to show when contracted
    */
    function FootballFixtures(options) {

        //Full list of competitions from CM, in priority order.
        //Mappings can be found here: http://cms.guprod.gnl/tools/mappings/pafootballtournament
        this.competitions = ['500', '510', '100', '300', '301', '101', '120', '127', '301', '213', '320', '701', '650', '102', '103', '121', '122', '123'];

        this.path =  "/football/api/frontscores?";
        this.queryString = "&competitionId=";

        // View
        this.view = {
            render: function (html) {
                bonzo(options.prependTo).after(html);
                common.mediator.emit('modules:footballfixtures:render');
                if(options.expandable) {
                    common.mediator.emit('modules:footballfixtures:expand', 'front-competition-fixtures');
                }
            }
        };
        
        // Model
        this.load = function (query) {
            var path = query,
                that = this;

            return ajax({
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

        this.generateQuery = function() {
            var query = this.queryString,
                competitions = options.competitions;

            if(options.competitions) {
                query += (competitions.length > 1) ? competitions.join(this.queryString) :  competitions[0];
            } else {
                query += this.competitions.join(this.queryString);
            }

            query += (options.contextual) ? '&competitionPage=true' : '&competitionPage=false';
            query += (options.expandable && options.numVisible) ? '&numVisible=' + options.numVisible : '';

            return this.path + query;
        };

        //Initalise
        this.init = function(opts) {
            opts = opts || {};
            ajax = opts.ajax || ajax; //For unit testing

            var query = (options.path) ? options.path : this.generateQuery();

            this.load(query);
        };

    }
    
    return FootballFixtures;

});