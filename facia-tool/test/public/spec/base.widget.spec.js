import BaseWidget from 'widgets/base-widget';
import ko from 'knockout';

class Widget extends BaseWidget {
    constructor() {
        this.one = ko.observable('one');
        this.two = ko.observable('two');
    }

    spy(spyOne, spyTwo) {
        this.subscribeOn(this.one, spyOne);
        this.subscribeOn(this.two, spyTwo);
    }
}

describe('Base Widget', function () {
    it('unsubscribes any registered callback', function () {
        var spyOne = jasmine.createSpy('spyOne'),
            spyTwo = jasmine.createSpy('spyTwo'),
            widget = new Widget();

        widget.spy(spyOne, spyTwo);
        widget.one('first');

        expect(spyOne.calls.count()).toBe(1);
        expect(spyOne.calls.argsFor(0)).toEqual(['first']);
        expect(spyOne.calls.first().object).toBe(widget);
        expect(spyTwo.calls.count()).toBe(0);

        spyOne.calls.reset();

        // Once the widget is disposed, all subscriptions are removed
        widget.dispose();
        widget.two('second');
        expect(spyOne.calls.count()).toBe(0);
        expect(spyTwo.calls.count()).toBe(0);
    });

    it('unsubscribes the correct class', function () {
        var spyOne = jasmine.createSpy('spyOne'),
            spyTwo = jasmine.createSpy('spyTwo'),
            widgetOne = new Widget(),
            widgetTwo = new Widget();

        widgetOne.spy(spyOne, spyTwo);
        widgetTwo.spy(spyOne, spyTwo);
        widgetOne.one('first');

        expect(spyOne.calls.count()).toBe(1);
        expect(spyOne.calls.first().object).toBe(widgetOne);

        spyOne.calls.reset();
        widgetOne.dispose();

        widgetTwo.one('first');
        expect(spyOne.calls.count()).toBe(1);
        expect(spyOne.calls.first().object).toBe(widgetTwo);

        spyOne.calls.reset();
        widgetTwo.dispose();

        widgetTwo.one('first');
        expect(spyOne.calls.count()).toBe(0);
    });
});
