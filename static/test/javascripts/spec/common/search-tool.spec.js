define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/modules/search-tool'
], function (
    bean,
    bonzo,
    $,
    SearchTool
    ) {

    ddescribe('Search tool', function () {
        var container,
            sut;

        beforeEach(function () {
            container = bonzo.create(
                    '<div class="search-tool js-search-tool">' +
                    '<div class="search-tool__form u-cf">' +
                    '<input class="search-tool__input js-search-tool-input" type="text" data-link-name="weather-list-location" />' +
                    '<button class="search-tool__btn"><i class="i i-search-white-36"></i></button>' +
                    '</div>' +
                    '<ul class="u-unstyled js-search-tool-list"></ul>' +
                    '</div>'
            )[0];

            $('body').append(container);

            sut = new SearchTool({
                container: $('.js-search-tool'),
                apiUrl: 'http://testapiurl'
            });
        });

        afterEach(function() {
            $('body').html("");
            container = null;
        });

        it("should be defined", function() {
            expect(sut).toEqual(jasmine.any(Object));
        });

        it("should bind events after initialization", function() {
            spyOn(sut, "bindEvents");

            sut.init();

            expect(sut.bindEvents).toHaveBeenCalled();
        });

        it("should respond to keydown event", function() {
            var stubEvent = {
                keyCode: 38,
                preventDefault: function() {},
                target: $('.js-search-tool-input')[0]
            };

            spyOn(sut, "move");
            spyOn(sut, "pushData");
            spyOn(sut, "getListOfResults");

            // Test for up key
            sut.handleKeyEvents(stubEvent);
            expect(sut.move).toHaveBeenCalledWith(-1);

            // Test for down key
            stubEvent.keyCode = 40;
            sut.handleKeyEvents(stubEvent);
            expect(sut.move).toHaveBeenCalledWith(1);

            // Test for down key
            stubEvent.keyCode = 13;
            sut.handleKeyEvents(stubEvent);
            expect(sut.pushData).toHaveBeenCalled();

            // Test for any other key
            stubEvent.keyCode = 22;
            sut.handleKeyEvents(stubEvent);
            expect(sut.getListOfResults).toHaveBeenCalledWith(stubEvent);
        });

        it("should push data after click on list item", function() {
            spyOn(sut, "pushData");

            $(".js-search-tool-list").html("<li><a></a></li>");

            sut.init();

            bean.fire($(".js-search-tool-list a")[0], "click");

            expect(sut.pushData).toHaveBeenCalled();
        });

        it("should not push data after enter without selecting from the list", function() {
            expect(sut.pushData()).toEqual(false);
        });

        it("should return new ID", function() {
            $(".js-search-tool-list").html("<li></li><li></li><li></li><li></li>");

            expect(sut.getNewId(0)).toEqual(0);
            expect(sut.getNewId(1)).toEqual(1);
            expect(sut.getNewId(2)).toEqual(2);
            expect(sut.getNewId(3)).toEqual(3);
            expect(sut.getNewId(4)).toEqual(-1);
            expect(sut.getNewId(-1)).toEqual(-1);
        });

        it("should not call for results if data haven't change", function() {
            var stubEvent = {
                keyCode: 38,
                preventDefault: function() {},
                target: {
                    value: "test"
                }
            };

            spyOn(sut, "fetchData");
            spyOn(sut, "hasInputValueChanged").and.returnValue(false);

            sut.getListOfResults(stubEvent);

            expect(sut.fetchData).not.toHaveBeenCalled();
        });

        it("should close list if input is empty", function() {
            var stubEvent = {
                keyCode: 8, // Backspace
                preventDefault: function() {},
                target: {
                    value: ""
                }
            };

            spyOn(sut, "fetchData");
            spyOn(sut, "clear");

            sut.getListOfResults(stubEvent);

            expect(sut.clear).toHaveBeenCalled();
            expect(sut.fetchData).not.toHaveBeenCalled();
        });

        it("should clear after pushing data", function() {
            spyOn(sut, "destroy");

            $(".js-search-tool-list").html('<li><a class="active"></a></li>');

            sut.init();

            jasmine.clock().install();

            sut.pushData();

            jasmine.clock().tick(1);
            expect(sut.destroy).not.toHaveBeenCalled();

            jasmine.clock().tick(51);
            expect(sut.destroy).toHaveBeenCalled();

            jasmine.clock().uninstall();
        });

        it("should fetch data", function(done) {
            var server = sinon.fakeServer.create();
            server.autoRespond = true;

            server.respondWith([200, { "Content-Type": "application/json" },
                '[{ "localizedName": "London"}]']);

            spyOn(sut, "renderList");

            sut.fetchData().then(function() {
                expect(sut.renderList).toHaveBeenCalledWith([{"localizedName": "London"}], 5);
                done();
            });

            server.restore();
        });

        it("should set input value", function() {
            spyOn(sut, "setInputValue").and.callThrough();

            sut.init();

            sut.setInputValue("test1");
            expect($(".js-search-tool-input").val()).toEqual("test1");

            $(".js-search-tool-list").html('<li><a class="active" data-weather-city="test2"></a></li>');
            sut.setInputValue();
            expect($(".js-search-tool-input").val()).toEqual("test2");
        });
    });
});

