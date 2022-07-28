import bean from 'bean';
import $ from 'lib/$';
import { fetchJson as fetchJson_ } from 'lib/fetch-json';
import { SearchTool } from 'facia/modules/onwards/search-tool';
import { mediator } from 'lib/mediator';

jest.mock('lib/raven');

jest.mock('lib/fetch-json', () => ({ fetchJson: jest.fn() }));

const fetchJson = (fetchJson_);

describe('Search tool', () => {
    let container;
    let sut;

    beforeEach(done => {
        container = $.create(
            '<div class="weather"><p class="weather__desc">' +
                '<span class="u-h">The temperature</span>' +
                '<span class="weather__time">Now</span>' +
                '<span class="u-h">is</span>' +
                '<span class="weather__temp js-weather-temp">35°C</span>' +
                '</p>' +
                '<span class="inline-weather-31 inline-weather weather__icon js-weather-icon"></span>' +
                '<input id="editlocation" class="search-tool__input js-search-tool-input js-weather-input" type="text" value="London" />' +
                '<ul class="u-unstyled search-tool__list js-search-tool-list"></ul>' +
                '</div>'
        );

        $('body').append(container);

        sut = new SearchTool({
            container,
            apiUrl: 'http://testapiurl',
        });

        done();
    });

    afterEach(() => {
        $('body').html('');
        container = null;
        fetchJson.mockReset();
    });

    it('should be defined', () => {
        expect(sut).toEqual(expect.any(Object));
    });

    it('should respond to keydown event', () => {
        const stubEvent = {
            keyCode: 38,
            preventDefault() {},
            target: $('.js-search-tool-input')[0],
        };

        jest.spyOn(sut, 'move');
        jest.spyOn(sut, 'pushData');
        jest.spyOn(sut, 'getListOfResults');

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
        fetchJson.mockImplementationOnce(() => Promise.resolve([]));
        sut.handleKeyEvents(stubEvent);
        expect(sut.getListOfResults).toHaveBeenCalledWith(stubEvent);
    });

    it('should close search tool if not clicked on the list', () => {
        jest.spyOn(mediator, 'emit');

        sut.handleClick({ target: $('body')[0] });
        expect(mediator.emit).toHaveBeenCalledWith(
            'autocomplete:toggle',
            false
        );
    });

    it('should push data after click on list item', () => {
        jest.spyOn(sut, 'pushData');
        jest.spyOn(mediator, 'emit');

        $('.js-search-tool-list').html(
            '<li><a class="js-search-tool-link active"></a><a class="js-search-tool-link" data-weather-id="292177" data-weather-city="Ufa"><span></span></a></li>'
        );

        bean.fire($('.js-search-tool-list span')[0], 'click');

        expect(sut.pushData).toHaveBeenCalled();
        expect(mediator.emit).toHaveBeenCalledWith('autocomplete:fetch', {
            id: '292177',
            city: 'Ufa',
            store: 'set',
        });
        expect($('.active').length).toEqual(1);
    });

    it('should not push data after enter without selecting from the list', () => {
        jest.spyOn(mediator, 'emit');

        $('.js-search-tool-input').val('');
        sut.pushData();

        expect(mediator.emit).toHaveBeenCalled();
        expect(mediator.emit).toHaveBeenCalledWith('autocomplete:fetch', {
            id: null,
            city: null,
            store: 'remove',
        });
    });

    it('should not push data after enter with uncomplete city name ', () => {
        $('.js-search-tool-input').val('Syd');

        expect(sut.pushData()).toEqual(undefined);
    });

    it('should return new ID', () => {
        $('.js-search-tool-list').html('<li></li><li></li><li></li><li></li>');

        expect(sut.getNewId(0)).toEqual(0);
        expect(sut.getNewId(1)).toEqual(1);
        expect(sut.getNewId(2)).toEqual(2);
        expect(sut.getNewId(3)).toEqual(3);
        expect(sut.getNewId(4)).toEqual(-1);
        expect(sut.getNewId(-1)).toEqual(-1);
    });

    it("should not call for results if data haven't change", () => {
        const stubEvent = {
            keyCode: 38,
            preventDefault() {},
            target: {
                value: 'test',
            },
        };

        jest.spyOn(sut, 'fetchData');
        jest.spyOn(sut, 'hasInputValueChanged').mockImplementation(() => false);

        sut.getListOfResults(stubEvent);

        expect(sut.fetchData).not.toHaveBeenCalled();
    });

    it('should close list if input is empty', () => {
        const stubEvent = {
            keyCode: 8, // Backspace
            preventDefault() {},
            target: {
                value: '',
            },
        };

        jest.spyOn(sut, 'fetchData');
        jest.spyOn(sut, 'clear');

        sut.getListOfResults(stubEvent);

        expect(sut.clear).toHaveBeenCalled();
        expect(sut.fetchData).not.toHaveBeenCalled();
    });

    it('should clear after pushing data', () => {
        jest.spyOn(sut, 'destroy');

        $('.js-search-tool-list').html(
            '<li><a class="active" data-weather-city="test2"></a></li>'
        );

        jest.useFakeTimers();

        sut.pushData();

        jest.runTimersToTime(1);
        expect(sut.destroy).not.toHaveBeenCalled();

        jest.runTimersToTime(51);
        expect(sut.destroy).toHaveBeenCalled();
    });

    it('should fetch data', done => {
        fetchJson.mockImplementationOnce(() =>
            Promise.resolve([{ localizedName: 'London' }])
        );

        jest.spyOn(sut, 'renderList');

        jest.useFakeTimers();
        sut.fetchData().then(() => {
            expect(sut.renderList).toHaveBeenCalledWith(
                [{ localizedName: 'London' }],
                5
            );
            done();
        });
        jest.runAllTimers();
    });

    it('should set input value', () => {
        jest.spyOn(sut, 'setInputValue');

        sut.setInputValue('test1');
        expect($('.js-search-tool-input').val()).toEqual('test1');

        $('.js-search-tool-list').html(
            '<li><a class="active" data-weather-city="test2"></a></li>'
        );
        sut.setInputValue();
        expect($('.js-search-tool-input').val()).toEqual('test2');
    });
});
