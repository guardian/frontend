define(["AutoComplete", 'Common']).then(

    function  (autoComplete, common) {
        describe("AutoComplete", function() {

            beforeEach(function() {
                spyOn(common.mediator, 'addListener');
                spyOn(common.mediator, 'emitEvent');

                mockSearchResult = {
                    results: [
                        { id: 1 }, { id: 2 }
                    ]
                }

                mockEmptySearchResult = {
                    results: [ ]
                }

                $('#autocomplete').remove();
                $('<div>').attr({id: 'autocomplete'}).insertBefore('body')
            });

           it("should render an auto-complete prompt after a successful tag search", function () {
                autoComplete.init();
                autoComplete.render(mockSearchResult, $('<div>'));
                expect($('#autocomplete').html()).toEqual('<ul class="dropdown-menu">' +
                                                            '<li><a href="#" data-id="1">1</a></li>' +
                                                            '<li><a href="#" data-id="2">2</a></li>' +
                                                           '</ul>');
           });

           it("should should broadcast when an item is selected from the auto-complete prompt", function () {
                autoComplete.init();
                autoComplete.render(mockSearchResult, $('<div>'));
                $('#autocomplete li:nth-child(2) a').trigger('click');
                expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('modules:autocomplete:selected');
           });

           it("should hide the auto-complete prompt when there is no search results", function () {
                autoComplete.init();
                autoComplete.render(mockEmptySearchResult, $('<div>'));
                expect($('#autocomplete').is(":visible")).toBeFalsy();
           });

           it("should insert the auto-complete prompt *after* a given tag entry input", function () {
                autoComplete.init();
                autoComplete.render(mockSearchResult, $('#autocomplete-after'));
                expect($('#autocomplete-after').next().attr('id')).toEqual('autocomplete');
           });

        });
    },

    function(e) {
        console.log('Something has gone wrong here with the curl.js loading', e);
    }
);
