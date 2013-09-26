curl([
	'models/networkFront',
	'knockout',
	'Config',
    'Common',
    'TagEntry',
    'AutoComplete',
    'TagSearch',
    'ItemSearch'
]).then(function(
	NetworkFront,
	Knockout,
	Config,
    Common,
    TagEntry,
    AutoComplete,
    TagSearch,
    ItemSearch
) {
 	var networkFront = new NetworkFront(frontConfig);
 	
 	// http://bit.ly/So4M9H
 	Knockout.bindingHandlers.numericValue = {
        init : function(element, valueAccessor, allBindingsAccessor) {
            var underlyingObservable = valueAccessor();
            var interceptor = Knockout.dependentObservable({
                read: underlyingObservable,
                write: function(value) {
                    if (!isNaN(value)) {
                        underlyingObservable(parseFloat(value));
                    }                
                } 
            });
            Knockout.bindingHandlers.value.init(element, function() { return interceptor }, allBindingsAccessor);
        },  
        update : Knockout.bindingHandlers.value.update
    };
 	
 	Knockout.applyBindings(networkFront, document.getElementById('network-front-tool'));

 	var errorAlert = $(
 		'<div class="alert alert-error">'
        	+ '<button type="button" class="close" data-dismiss="alert">×</button>'
        	+ '<h4>Error!</h4>'
        	+ '<p class="message">There are errors in the form</p>'
    	+ '</div>'
	);

	var successAlert = $(
 		'<div class="alert alert-success">'
        	+ '<button type="button" class="close" data-dismiss="alert">×</button>'
        	+ '<h4>Success!</h4>'
        	+ '<p class="message">Form successfully saved</p>'
    	+ '</div>'
	);

    $('#network-front-tool').submit(function(e) {
    	e.preventDefault();
    	var form = $(e.currentTarget);
    	if (form.find('.invalid').length) {
    		errorAlert.insertBefore(form);
    	} else {
            $('body').addClass('saving');
            // disable save button
            form.find('#save-frontend').attr('disabled', 'disabled');
    		Common.mediator.emitEvent('ui:networkfronttool:save');
    	}
    });

    Common.mediator.addListener('models:networkfront:save:complete', function() {
        $('body').removeClass('saving');
        $('#save-frontend').removeAttr('disabled');
    });

    $('#network-front-tool .typeahead').blur(function(e) {
    	if ($(e.currentTarget).val()) {
    		Common.mediator.emitEvent('ui:networkfronttool:tagid:selected', [{}, e.currentTarget]);
    	}
    });

    // can't use standard reset type, doesn't fire change event on form
    $('#network-front-tool #clear-frontend').click(function(e) {
    	Common.mediator.emitEvent('ui:networkfronttool:clear');
    });

    // success alert when saved
    Common.mediator.addListener('models:networkfront:save:success', function(networkFront) {
    	errorAlert.alert('close');
    	successAlert.addClass('fade in').insertBefore($('#network-front-tool'));
    	setTimeout(function(){ successAlert.alert('close'); }, 2000);
    });

    new TagSearch.init({ apiEndPoint: '/api/tag' });
    new ItemSearch.init({ apiEndPoint: '/api/item/' });
    new AutoComplete.init();
    new TagEntry.init( { nodeList: $('.typeahead') } );

});
