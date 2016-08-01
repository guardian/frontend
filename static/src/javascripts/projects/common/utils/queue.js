define([], function (
) {

    /**
     * Initialise a queue object
     *
     * @constructor
     */
    function Queue() {
        this.queue = [];
    }

    /**
     * Add an item to the queue
     *
     * @param  {Object} item  item to add
     * @return {Number}       queue length
     */
    Queue.prototype.enqueue = function(item) {
        return this.queue.push(item);
    };

    /**
     * Take the first item from the queue
     *
     * @return {Object} the item
     */
    Queue.prototype.dequeue = function() {
        return this.queue.shift();
    };

    /**
     * Check if the queue is empty
     *
     * @return {Boolean}
     */
    Queue.prototype.empty = function() {
        return this.queue.length === 0;
    };

    return Queue;
});
