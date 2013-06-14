define(['models/story', 'Config', 'Knockout', 'Common', 'Reqwest'], function (Story, Config, ko, Common, Reqwest) {

    var Stories = function(opts) {
        var endpoint = '/story',
            self = this;

        this.stories = ko.observableArray();

        // Temporary
        this.selected = ko.observable(); // The selected story

        this.length = ko.computed(function(){
            return this.stories().length;
        }, this)

        this.loadStory = function(o) {
            var story;
            o = o || {_tentative: true};
            story = new Story(o);
            self.stories.unshift(story);
            return story; 
        };
        
        this.toggleNotableAssociation = function(s) {
            self.selected().toggleNotableAssociation(s.id());
        };
        
        this.hasNotableAssociationWith = function(id) {
            return (self.selected().notableAssociations().indexOf(id) > -1)
        };
        

        this.loadSelectedStory = function(o) {
            var story;
            this.stories.remove(this.selected());
            o = o || {};
            o.articleCache = opts.articleCache;
            story = new Story(o);
            self.stories.unshift(story);
            this.selected(story);
            return story; 
        };

        this.setSelected = function(story) {
            self.selected(story);
            story._selected(false) // Confusing names. change to _selectedEvent() etc.
            return story;
        };

        this.clearSelected = function(story) {
            var doIt = story._tentative() ? self.deleteSelected(story) : true;
            if (doIt) {
                window.location.href = '/events';
            }
        };

        this.createStory = function() {
            self.setSelected(self.loadStory());
        };

        this.deleteSelected = function(story){            
            var doIt = window.confirm("Permanently delete this story?");
            if (doIt) {
                self.selected().delete();
                self.selected(false);
                self.stories.remove(story);
            }
            return doIt;
        };

        this.cancelEditing = function(story) {
            story._editing(false);
            if (story._tentative()) {
                self.stories.remove(story);
                self.selected(false);
            }
        }

        this.loadStories = function() {
            Reqwest({
                url: '/story',
                type: 'json',
                success: function(resp) {
                    self.stories.removeAll();
                    resp.map(function(s){
                        self.loadStory(s);
                    });
                },
                error: function() {}
            });
        };

        // Decorate articles for the selected story 
        this.selected.subscribe(function(story) {
            if (story) {
                story.decorateContents();
            }
        });
    };

    return Stories;
});
