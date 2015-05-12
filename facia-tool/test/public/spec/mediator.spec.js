import mediator from 'utils/mediator';

describe('Mediator', function () {
    it('handles scopes', function () {
        var counters = {
            one: 0,
            two: 0
        };

        mediator.on('one', function () {
            counters.one += 1;
        });
        var scope1 = mediator.scope();
        scope1.on('one', function () {
            counters.one += 1;
        });
        scope1.on('two', function () {
            counters.two += 1;
        });

        var scope2 = mediator.scope();
        scope2.on('one', function () {
            counters.one += 1;
        });
        scope2.on('two', function () {
            counters.two += 1;
        });

        mediator.emit('one');
        expect(counters).toEqual({
            one: 3,
            two: 0
        });
        mediator.emit('two');
        expect(counters).toEqual({
            one: 3,
            two: 2
        });

        scope1.dispose();
        mediator.emit('one');
        expect(counters).toEqual({
            one: 5,
            two: 2
        });

        mediator.emit('two');
        expect(counters).toEqual({
            one: 5,
            two: 3
        });

        scope2.dispose();
        mediator.emit('one');
        expect(counters).toEqual({
            one: 6,
            two: 3
        });
    });
});
