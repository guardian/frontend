curl([
    'models/stories',
    'models/articles',
    'knockout',
    'knockoutSortable',
    'Reqwest',
    'Config',
    'Common'
]).then(function(
    Stories,
    Articles,
    ko,
    Sortable,
    Reqwest,
    Config,
    Common
) {
    var maxContentPerStory = 50,
        viewModel = {};

    if(!Common.hasVh()) {
        //this fixes the article and event lists to the height of the viewport
        //If CSS3 vh units are not supported
        var h = (window.innerHeight - 200) + 'px';
        $('.articles').css('maxHeight', h);
        $('.story').css(   'maxHeight', h);
    }

    viewModel.articles = new Articles();
    viewModel.stories  = new Stories();
    viewModel.pendingSave = ko.observable(false);
    viewModel.failedSave  = ko.observable(false);
    viewModel.frontUrlBase = Config.preview,

    viewModel.stories.loadStories();

    viewModel.articles.search();

    function onDragStart(event) {
        $(event.target).css('opacity', '0.3'); 
    }

    function onDragEnd(event) {
        setTimeout(function(){
            $(event.target).css('opacity', '1');
        }, 1000);
    }

    function onDragOver(event) {
        event.preventDefault();
        $(event.currentTarget).addClass('onDragOver');
    }

    function onDragLeave(event) {
        event.preventDefault();
        $(event.currentTarget).removeClass('onDragOver');
    }

    function onDrop(event) {
        event.preventDefault();
        var id = event.dataTransfer.getData('Text');
        var el = event.currentTarget;
        var target = ko.dataFor(el);
        if (viewModel.stories.selected()._contentsCount() < maxContentPerStory) {
            target.addArticle(id)
        } else {
            window.alert("Oops! You've reached the maximum of " + maxContentPerStory + " articles per story.");
        }
        $(el).removeClass('onDragOver');
        $(el).addClass('onDrop');
        setTimeout(function(){
            $(el).removeClass('onDrop');
       }, 1000);
    }

    ko.bindingHandlers.makeDraggable = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.addEventListener('dragstart', onDragStart, false);
            element.addEventListener('dragend',   onDragEnd,   false);
        }
    };

    ko.bindingHandlers.makeDropabble = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            element.addEventListener('dragover',  onDragOver,  false);
            element.addEventListener('dragleave', onDragLeave, false);
            element.addEventListener('drop',      onDrop,      false);
        }
    };

    Common.mediator.addListener('models:story:haschanges', function(){
        if (viewModel.stories.selected()) {
            viewModel.stories.selected().backgroundSave();            
            viewModel.pendingSave(true);
            viewModel.failedSave(false);
        }
    });

    Common.mediator.addListener('models:story:save:success', function(){
        viewModel.pendingSave(false);
        viewModel.failedSave(false);
    });

    Common.mediator.addListener('models:story:save:error', function(){
        viewModel.pendingSave(false);
        viewModel.failedSave(true);
    });

    // Poll for changes to selected story, or to story list
    setInterval(function(){
        var story = viewModel.stories.selected();
        if(story && story._lastModifiedDate() && !viewModel.pendingSave()) {
            Reqwest({
                url: '/story/' + story.id(),
                type: 'json',
                success: function(resp) {
                    if (resp.lastModified.date !== story._lastModifiedDate() && !viewModel.pendingSave()) {
                        story._lastModifiedDate(resp.lastModified.date);
                        viewModel.stories.loadSelectedStory(resp);
                        viewModel.stories.selected()._updatedBy(resp.lastModified.email)
                    }
                },
                error: function() {
                    window.alert("Oops! There was a problem saving this story.");
                    window.location.reload();
                }
            });
        } else if (!story) {
            viewModel.stories.loadStories();
        }
    }, 5000);

    //Init bing for sortable agent events
    ko.bindingHandlers.sortable.afterMove = function() {
        Common.mediator.emitEvent('models:story:haschanges');
    };

    // Render
    ko.applyBindings(viewModel);

});
