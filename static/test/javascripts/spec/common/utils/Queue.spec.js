define([
    'common/utils/Queue'
], function (
    Queue
) {

    describe('Queue Utility', function () {
        var initialQueue;

        // Setup

        beforeEach(function () {
            initialQueue = Queue;
        });

        afterEach(function () {
            initialQueue = undefined;
        });

        // Tests


        it('should initialise multiple queues on multiple calls', function () {
            var secondQueue = Queue;

            initialQueue.enqueue('i1');
            secondQueue.enqueue('i2');

            expect(initialQueue.dequeue()).toBe('i1');
            expect(secondQueue.dequeue()).toBe('i2');
        });

        it('if queueing one item it should return it when dequeue is called', function () {
            initialQueue.enqueue('i1');
            expect(initialQueue.dequeue()).toBe('i1');
        });

        it('if queueing multiple items it should return them in order when dequeued', function () {
            var queueArr = ['i1', 'i2', 'i3'];

            queueArr.map(function(item){
               initialQueue.enqueue(item);
            });

            var dequeuedArr = [];

            queueArr.map(function() {
                dequeuedArr.push(initialQueue.dequeue());
            });

            expect(queueArr).toEqual(dequeuedArr);
        });

        it('the empty method should return the correct booleans', function () {
            expect(initialQueue.empty()).toBe(true);
            initialQueue.enqueue('i1');
            expect(initialQueue.empty()).toBe(false);
        });
    });
});
