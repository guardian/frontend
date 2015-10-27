define([
    'bean',
    'common/utils/$',
    'helpers/injector'
], function (
    bean,
    $,
    Injector
) {
    describe('Search tool', function () {
        var container,
            sut,
            injector = new Injector(),
            SearchTool, mediator;

        beforeEach(function (done) {
            injector.require(['facia/modules/onwards/search-tool', 'common/utils/mediator'], function () {
                SearchTool = arguments[0];
                mediator = arguments[1];

                container = $.create('<div class="weather"><p class="weather__desc">' +
                    '<span class="u-h">The temperature</span>' +
                    '<span class="weather__time">Now</span>' +
                    '<span class="u-h">is</span>' +
                    '<span class="weather__temp js-weather-temp">35°C</span>' +
                    '</p>' +
                    '<span class="inline-weather-31 inline-weather weather__icon js-weather-icon"></span>' +
                    '<input id="editlocation" class="search-tool__input js-search-tool-input js-weather-input" type="text" value="London" />' +
                    '<ul class="u-unstyled search-tool__list js-search-tool-list"></ul>' +
                    '</div>');

                $('body').append(container);

                sut = new SearchTool({
                    container: container,
                    apiUrl: 'http://testapiurl'
                });

                done();
            });
        });

        afterEach(function () {
            $('body').html('');
            container = null;
        });

        it('should be defined', function () {
            expect(sut).toEqual(jasmine.any(Object));
        });

        it('should bind events after initialization', function () {
            spyOn(sut, 'bindEvents');

            sut.init();

            expect(sut.bindEvents).toHaveBeenCalled();
        });

        it('should respond to keydown event', function () {
            var stubEvent = {
                keyCode: 38,
                preventDefault: function () {},
                target: $('.js-search-tool-input')[0]
            };

            spyOn(sut, 'move');
            spyOn(sut, 'pushData');
            spyOn(sut, 'getListOfResults');

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

        it('should close search tool if not clicked on the list', function () {
            spyOn(mediator, 'emit');

            sut.handleClick({target: $('body')[0]});
            expect(mediator.emit).toHaveBeenCalledWith('autocomplete:toggle', false);
        });

        it('should push data after click on list item', function () {
            spyOn(sut, 'pushData').and.callThrough();
            spyOn(mediator, 'emit');

            $('.js-search-tool-list').html('<li><a class="js-search-tool-link active"></a><a class="js-search-tool-link" data-weather-id="292177" data-weather-city="Ufa"><span></span></a></li>');
            sut.init();

            bean.fire($('.js-search-tool-list span')[0], 'click');

            expect(sut.pushData).toHaveBeenCalled();
            expect(mediator.emit).toHaveBeenCalledWith('autocomplete:fetch',
                {
                    'id': '292177',
                    'city': 'Ufa',
                    'store': 'set'
                }
            );
            expect($('.active').length).toEqual(1);
        });

        it('should not push data after enter without selecting from the list', function () {
            sut.init();
            $('.js-search-tool-input').val('');

            expect(sut.pushData()).toEqual({'id': null, 'city': null, 'store': 'remove'});
        });

        it('should not push data after enter with uncomplete city name ', function () {
            sut.init();
            $('.js-search-tool-input').val('Syd');

            expect(sut.pushData()).toEqual(false);
        });

        it('should return new ID', function () {
            $('.js-search-tool-list').html('<li></li><li></li><li></li><li></li>');

            sut.init();

            expect(sut.getNewId(0)).toEqual(0);
            expect(sut.getNewId(1)).toEqual(1);
            expect(sut.getNewId(2)).toEqual(2);
            expect(sut.getNewId(3)).toEqual(3);
            expect(sut.getNewId(4)).toEqual(-1);
            expect(sut.getNewId(-1)).toEqual(-1);
        });

        it('should not call for results if data haven\'t change', function () {
            var stubEvent = {
                keyCode: 38,
                preventDefault: function () {},
                target: {
                    value: 'test'
                }
            };

            spyOn(sut, 'fetchData');
            spyOn(sut, 'hasInputValueChanged').and.returnValue(false);

            sut.getListOfResults(stubEvent);

            expect(sut.fetchData).not.toHaveBeenCalled();
        });

        it('should close list if input is empty', function () {
            var stubEvent = {
                keyCode: 8, // Backspace
                preventDefault: function () {},
                target: {
                    value: ''
                }
            };

            spyOn(sut, 'fetchData');
            spyOn(sut, 'clear');

            sut.getListOfResults(stubEvent);

            expect(sut.clear).toHaveBeenCalled();
            expect(sut.fetchData).not.toHaveBeenCalled();
        });

        it('should clear after pushing data', function () {
            spyOn(sut, 'destroy');

            $('.js-search-tool-list').html('<li><a class="active" data-weather-city="test2"></a></li>');

            sut.init();

            jasmine.clock().install();

            sut.pushData();

            jasmine.clock().tick(1);
            expect(sut.destroy).not.toHaveBeenCalled();

            jasmine.clock().tick(51);
            expect(sut.destroy).toHaveBeenCalled();

            jasmine.clock().uninstall();
        });

        it('should fetch data', function (done) {
            var server = sinon.fakeServer.create();
            server.autoRespond = true;

            server.respondWith([200, { 'Content-Type': 'application/json' },
                '[{ "localizedName": "London"}]']);

            spyOn(sut, 'renderList');

            sut.fetchData().then(function () {
                expect(sut.renderList).toHaveBeenCalledWith([{'localizedName': 'London'}], 5);
                done();
            });

            server.restore();
        });

        it('should set input value', function () {
            spyOn(sut, 'setInputValue').and.callThrough();

            sut.init();

            sut.setInputValue('test1');
            expect($('.js-search-tool-input').val()).toEqual('test1');

            $('.js-search-tool-list').html('<li><a class="active" data-weather-city="test2"></a></li>');
            sut.setInputValue();
            expect($('.js-search-tool-input').val()).toEqual('test2');
        });
    });
});

