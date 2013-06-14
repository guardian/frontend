define(['models/editable', 'models/article', 'models/agent', 'models/place', 'Knockout', 'Config', 'Common', 'Reqwest'], 
        function (Editable, Article, Agent, Place, ko, Config, Common, Reqwest) {

    // zero pad the date getters
    Date.prototype.getHoursPadded = function() {
        return ("0" + this.getHours()).slice(-2);
    };
    
    Date.prototype.getMinutesPadded = function() {
        return ("0" + this.getMinutes()).slice(-2);
    };

    var Event = function(opts) {

        var maxBumpedArticles = 2,
            importanceBumped  = 100,
            importanceDefault = 50,
            bumped = [],
            self = this;

        opts = opts || {};

        // General 'schema' poperties
        this.title      = ko.observable(opts.title || '');
        this.explainer  = ko.observable(opts.explainer || '');
        this.importance = ko.observable(opts.importance || importanceDefault);
        
        // Content
        this.content = ko.observableArray();
        (opts.content || []).map(function(a){
            self.content.push(new Article(a));
        });

        // Agents
        this.agents = ko.observableArray(); // people, organisations etc.
        (opts.agents || []).map(function(a){
            self.agents.push(new Agent(a));
        });

        // Places
        this.places     = ko.observableArray(); // locations 
        (opts.places || []).map(function(p){
            self.places.push(new Place(p));
        });
        
        // Dates
        this._humanDate  = ko.observable();
        this._prettyDate = ko.observable();
        this._prettyTime = ko.observable();        
        
        this.startDate  = ko.computed({
            read: function() {
                return this._prettyDate() + 'T' + this._prettyTime() + ':00.000Z';
            },
            write: function(value) {
                var d = new Date(value);
                this._prettyDate(d.toISOString().match(/^\d{4}-\d{2}-\d{2}/)[0]);
                this._prettyTime(d.getHoursPadded() +':'+ d.getMinutesPadded());
                this._humanDate(humanized_time_span(d));
            },
            owner: this
        });

        if (opts.startDate) {
            this.startDate(new Date(opts.startDate)); // today
        } else {
            var d = new Date();
            this.startDate(d);
        }

        // Track for editability / saving 
        this._makeEditable(['title', 'explainer', 'importance', '_prettyDate', '_prettyTime']);

        // Explainer - for textarea, replace <br/> with \n 
        this._explainerBreaks = ko.computed({
            // replace p's with br's, and unwrap
            read: function(value) {return this.explainer().replace(/\s*(<\/p><p>|<br\s*\/>)\s*/g, '\n').replace(/^<p>([\S\s]*)<\/p>$/, '$1')},
            // replace line breaks with p's, and wrap
            write: function(value) {
                var newValue = value.replace(/(\r\n|\n|\r)/gm, '</p><p>');
                if (newValue) {
                    newValue = '<p>' + newValue + '</p>';
                }
                this.explainer(newValue)
            },
            owner: this
        });

        // Administrative vars
        this._tentative   = ko.observable(opts._tentative);

        if (bumped.length === 0) {
            self.content().map(function(a){
                if (a.importance() > importanceDefault) {
                    bumped.push(a.id());
                }
            });
        }

        this.addArticle = function(id) {
            var included,
                article;
            id = self.urlPath(id);
            if (id) {
                included = _.some(self.content(), function(item){
                    return item.id() === id;
                });
                if (!included) {
                    article = new Article({id: id});
                    self.content.unshift(article);
                    // Sort articles by date, descending.
                    self.decorateContent();
                    Common.mediator.emitEvent('models:story:haschanges');
                }
            } else {
                window.alert("Sorry, only Guardian pages can be added here!");
            }                
        };

        this.decorateContent = function() {
            var apiUrl = "/api/proxy/search";
            // and grab them from the API
            if(this.content().length) {
                apiUrl += "?page-size=50&format=json&show-fields=all&show-tags=all&api-key=" + Config.apiKey;
                apiUrl += "&ids=" + this.content().map(function(article){
                    return encodeURIComponent(article.id());
                }).join(',');

                new Reqwest({
                    url: apiUrl,
                    type: 'jsonp',
                    success: function(resp) {
                        if (resp.response && resp.response.results) {
                            resp = resp.response.results;
                            resp.map(function(ra){
                                if (ra.id && ra.webTitle) {
                                    var c = _.find(self.content(),function(a){
                                        return a.id() === ra.id;
                                    });
                                    if (c) {
                                        c.webTitle(ra.webTitle);
                                        c.webPublicationDate(ra.webPublicationDate);
                                        if (ra.fields && ra.fields.shortUrl) {
                                            c.shortId(ra.fields.shortUrl.match(/[^\/]+$/)[0]);
                                        }
                                        c.addPerformanceCounts();
                                        Common.mediator.emitEvent('models:story:haschanges');
                                    }
                                }
                            });
                            self.content.sort(function (left, right) {
                                var ld = left.webPublicationDate(),
                                    rd = right.webPublicationDate();
                                return (ld > rd) ? -1 : 1;
                            });
                        }
                    },
                    error: function() {}
                });
            }
            return this.content().length;
        };

        this.removeArticle = function(article) {
            var result = window.confirm("Are you sure you want to DELETE this article?");
            if (!result) return;
            self.content.remove(article);
            Common.mediator.emitEvent('models:story:haschanges');
        };


        this.addAgentPerson = function(article) {
            self.agents.unshift(new Agent({rdfType: 'http://schema.org/Person'}));
        };

        this.addAgentOrganization = function(article) {
            self.agents.unshift(new Agent({rdfType: 'http://schema.org/Organization'}));
        };
        
        this.removeAgent = function(article) {
            var term = (article.rdfType === "http://schema.org/Person") ? 'person' : 'organisation'
              , result = window.confirm("Are you sure you want to DELETE this " + term + "?");
            if (!result) return;
            self.agents.remove(article);
            Common.mediator.emitEvent('models:story:haschanges');
        };
        
        this.addPlace = function(article) {
            self.places.unshift(new Place());
        };

        this.removePlace = function(p) {
            var result = window.confirm("Are you sure you want to DELETE this place?");
            if (!result) return;
            self.places.remove(p);
            Common.mediator.emitEvent('models:story:haschanges');
        };

        this.bump = function() {
            self.importance(self.importance() === importanceBumped ? importanceDefault : importanceBumped);
        };

        this.bumpContent = function(item) {
            var id = item.id();
            if (_.contains(bumped, id)) {
                bumped = _.without(bumped, id);
            } else {
                bumped.unshift(id);
                bumped = bumped.slice(0,maxBumpedArticles);
            }
            // Now adjust the importance of all content items accordingly
            self.content().map(function(a){
                if (_.some(bumped, function(b){
                    return a.id() === b;
                })) {
                    a.importance(importanceBumped);
                } else {
                    a.importance(importanceDefault);
                }
            });
            Common.mediator.emitEvent('models:story:haschanges');
        };
    
        this.urlPath = function(url) {
            var a = document.createElement('a'),
                p;
            a.href = url;
            if (a.hostname.match(/guardian/)) {
                p = a.pathname;
                p = p.indexOf('/') === 0 ? p.substr(1) : p;
                return p;
            } else if (a.hostname.match(/google/)) {
                p = a.search.match(/url=([^&]+)/);
                if (!p) {
                    p = a.search.match(/q=([^&]+)/);
                }
                return p ? this.urlPath(decodeURIComponent(p[1])) : false;
            }
        };
    };

    Event.prototype = new Editable();

    return Event;
});
