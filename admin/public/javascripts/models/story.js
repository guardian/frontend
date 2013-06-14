define([
    'models/editable',
    'models/event',
    'Config',
    'Knockout',
    'Common',
    'Reqwest'],
function (
    Editable,
    Event,
    Config,
    ko,
    Common,
    Reqwest
) {

    var Story = function(opts) {
        var endpoint = '/story',
            saveInterval = 1000, // milliseconds
            deBounced,
            self = this;

        opts = opts || {};

        this.title = ko.observable(opts.title || '');
        this.explainer = ko.observable(opts.explainer || '');
        this.hero = ko.observable(opts.hero || '');
        this.id = ko.observable(opts.id);
        this.events = ko.observableArray();
        this.notableAssociations = ko.observableArray(opts.notableAssociations || []);
        this.labels = opts.labels || {}; // not editable in the UI yet

        this._lastModifiedEmail = ko.observable(opts.lastModified ? opts.lastModified.email : '');
        this._lastModifiedDate  = ko.observable(opts.lastModified ? opts.lastModified.date  : '');
        this._lastModifiedDatePretty  = ko.computed(function(){
            return opts.lastModified ? humanized_time_span(opts.lastModified.date) : '';
        }, this);

        // Track for editability / saving
        this._makeEditable(['title', 'explainer', 'hero']);

        // Temporary
        this._selected  = ko.observable(); // The selected event
        this._tentative = ko.observable(opts._tentative); // No id means it's a new un-persisted event,
        this._updatedBy = ko.observable(); // Who else just updated this story
        this._performanceCount = ko.observable(0); // To show progress when gathering performance stats

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

        this._contentsCount = ko.computed(function(){
            return _.reduce(this.events(), function(cc, event) {
                return cc + event.content().length;
            }, 0);
        }, this);

        this.loadEvent = function(o) {
            var event;
            o = o || {};
            event = new Event(o);
            self.events.push(event);
        };

        (opts.events || []).map(function(a){
            self.loadEvent(a);
        });

        this.setSelected = function(current) {
            self._selected(current);
        };

        this.clearSelected = function(current) {
            self._selected(undefined);
        };
        
        this.toggleNotableAssociation = function(id) {
            if ( self.notableAssociations().indexOf(id) >= 0 ) {
                self.notableAssociations.remove(id);
            } else {
                self.notableAssociations.unshift(id);
            }
            Common.mediator.emitEvent('models:story:haschanges');
        };

        this.createEvent = function() {
            var event = new Event({_tentative: true});
            self.events.unshift(event);
            self._selected(event);
        };

        this.deleteEvent = function(event){            
            var result = window.confirm("Permanently delete this chapter?");
            if (!result) return;
            self.events.remove(event);
            self._selected(false);
            Common.mediator.emitEvent('models:story:haschanges');
        };
        
        this.cancelEditing = function(event) {
            event._editing(false);
            if (event._tentative()) {
                self._selected(false);
                self.events.remove(event);
            }
        }

        this.decorateContents = function() {
            this.events().map(function(event){
                self._performanceCount(self._performanceCount() + event.decorateContent());
            });
        };

        Common.mediator.addListener('models:article:performance:done', function(){
            self._performanceCount(Math.max(self._performanceCount() - 1, 0));
        });

        this.save =  function() {
            var url = endpoint;

            // Post to the persisted id - even if we're changing the id
            if (self.id()) {
                url += '/' + self.id();
            } else {
                self.id("" + Math.floor(Math.random()*1000000));
            }
            
            // Sort by date, descending.
            this.events.sort(function (left, right) {
                var ld = left.startDate(),
                    rd = right.startDate();
                return (ld > rd) ? -1 : 1;
            });

            console && console.log('SENT:');
            console && console.log(JSON.stringify(self) + "\n\n")

            new Reqwest({
                url: url,
                method: 'post',
                type: 'json',
                contentType: 'application/json',
                data: JSON.stringify(self),
                success: function(resp) {
                    console && console.log('RECEIVED:')
                    console && console.log(JSON.stringify(resp) + "\n\n")
                    self._lastModifiedDate(resp.lastModified.date);
                    // Mark event as real
                    self._tentative(false);
                    self._updatedBy(false);
                    Common.mediator.emitEvent('models:story:save:success');
                },
                error: function() {
                    Common.mediator.emitEvent('models:story:save:error');
                }
            });
        };

        this.delete =  function() {
            if (self.id()) {
                new Reqwest({
                    url: endpoint + '/' + self.id(),
                    method: 'delete',
                    type: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify(self),
                    success: function(resp) {
                        Common.mediator.emitEvent('models:story:delete:success');
                    },
                    error: function() {
                        Common.mediator.emitEvent('models:story:delete:error');
                    }
                });
            }
        };

        this.backgroundSave = function() {
            clearTimeout(deBounced);
            deBounced = setTimeout(function(){
                self.save();
            }, saveInterval);
        };
    };

    Story.prototype = new Editable();

    return Story;
});
