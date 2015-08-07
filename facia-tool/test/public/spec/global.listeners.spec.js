import * as listeners from 'utils/global-listeners';
import $ from 'jquery';

describe('Global listeners', function () {
    beforeEach(function () {
        this.dom = $('<div class="test-div"></div>').appendTo(document.body);
    });
    afterEach(function () {
        this.dom.remove();
    });

    it('handles global events', function () {
        var clickOne = jasmine.createSpy('clickOne'),
            clickTwo = jasmine.createSpy('clickTwo'),
            scopeA = { a: true },
            scopeB = { b: true };

        listeners.on('click', clickOne);
        listeners.on('click', clickTwo, scopeA);
        listeners.on('click', clickTwo, scopeB);

        this.dom.click();
        expect(clickOne.calls.count()).toBe(1);
        expect(clickTwo.calls.count()).toBe(2);

        listeners.off('mouseover');
        listeners.off('click', clickTwo);
        // It should remove both clickTwo listeners
        this.dom.click();
        expect(clickOne.calls.count()).toBe(2);
        expect(clickTwo.calls.count()).toBe(2);

        // Add them again to the remove everything
        listeners.on('click', clickTwo, scopeA);
        listeners.on('click', clickTwo, scopeB);
        listeners.off('click');
        this.dom.click();
        expect(clickOne.calls.count()).toBe(2);
        expect(clickTwo.calls.count()).toBe(2);
    });
});
