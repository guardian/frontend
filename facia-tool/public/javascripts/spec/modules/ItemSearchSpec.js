define(["ItemSearch", 'Common'], function(itemSearch, common) {

    describe("ItemSearch", function() {

        beforeEach(function() {
            spyOn(common.mediator, 'addListener');
            spyOn(common.mediator, 'emitEvent');
        });

        it("should search the content API for a given tag", function() {

            var mockReqwest = jasmine.createSpy('reqwest');

            itemSearch.init({reqwest: mockReqwest});
            itemSearch.search({}, $('<input/>').attr({
                    value: 'football/womensfootball'
                }));

            expect(mockReqwest.wasCalled).toBeTruthy();
            expect(common.mediator.addListener.mostRecentCall.args[0]).toEqual('modules:itemsearch:success');
            expect(mockReqwest.mostRecentCall.args[0].url.indexOf('http://content.guardianapis.com/football/womensfootball')).toEqual(0);

        });

        it("should determine if the tag is valid", function() {

             var mockResponse = { 'tag': 1 };
             var mockEmptyResponse = { };

             itemSearch.init()
             itemSearch.validateTag(mockResponse, $('<input/>'));

             expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('modules:tagvalidation:success');

             itemSearch.validateTag(mockEmptyResponse, $('<input/>'));
             expect(common.mediator.emitEvent.mostRecentCall.args[0]).toEqual('modules:tagvalidation:failure');

        });

    })
});
