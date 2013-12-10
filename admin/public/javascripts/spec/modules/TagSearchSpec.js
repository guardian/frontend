define(["TagSearch", 'Common'], function(tagSearch, common) {

    describe("TagSearch", function() {

        beforeEach(function() {
            // spy on the mediator
            spyOn(common.mediator, 'addListener');
        });

        it("should add modules:oncomplete event listener to mediator", function() {
            // init the TagSearch
            tagSearch.init();
            // mediator's addListener should have been called...
            expect(common.mediator.addListener).toHaveBeenCalled();
            // ...and with correct event
            expect(common.mediator.addListener.mostRecentCall.args[0]).toEqual('modules:oncomplete');
        });

        it("modules:oncomplete event handler should call reqwest", function() {
            // create mock reqwest function
            var mockReqwest = jasmine.createSpy('reqwest');
            // init the TagSearch, with mock reqwest
            tagSearch.init({reqwest: mockReqwest});
            // get the handler
            var modulesOnCompleteHandler = common.mediator.addListener.mostRecentCall.args[1]
            // call the handler
            modulesOnCompleteHandler({value: 'foo'});
            // confirm spy was called
            expect(mockReqwest).toHaveBeenCalled();
        });

        describe('Reqwest should have correct params', function() {

            var mockReqwest,
                apiEndPoint = 'http://www.foo.com/bar',
                tag         = 'example/tag',
                apiKey      = '12345',
                expectedUrl = 'http://www.foo.com/bar?q=example%2Ftag&format=json&page-size=50&api-key=12345'


            beforeEach(function() {
                mockReqwest = jasmine.createSpy('reqwest');
                // set apiEndPoint and apiKey to something, along with mock reqwest
                tagSearch.init(
                    {
                        apiEndPoint: apiEndPoint, reqwest: mockReqwest, config: {apiKey: apiKey}
                    }
                );
                // call handler
                common.mediator.addListener.mostRecentCall.args[1]({value: tag});
            });

            it('should have type jsonp', function() {
                expect(mockReqwest.mostRecentCall.args[0]['type']).toEqual('jsonp');
            });

            it('should have correct url', function() {
                expect(mockReqwest.mostRecentCall.args[0]['url']).toEqual(expectedUrl);
            });

            it('should have a success callback', function() {
                expect(mockReqwest.mostRecentCall.args[0]['success']).toBeDefined();
            });

            describe('Reqwest success callback', function() {

                it('should emit modules:tagsearch:success event and pass json on success', function() {
                    var successCallback = mockReqwest.mostRecentCall.args[0]['success'];
                    // spy on the mediator
                    spyOn(common.mediator, 'emitEvent');
                    // call callback, with example json
                    var response = 'bar';
                    successCallback({response: response});
                    // should have called emitEvent...
                    expect(common.mediator.emitEvent).toHaveBeenCalled();
                    // ... with correct params
                    var emitEventParams = common.mediator.emitEvent.mostRecentCall.args
                    expect(emitEventParams[0]).toBe('modules:tagsearch:success');
                    expect(emitEventParams[1]).toEqual([response, {value: tag}]);
                });

            });



        });

    });
});
