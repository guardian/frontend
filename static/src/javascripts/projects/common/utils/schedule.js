define(function () {
    var mockDeadline = { didTimeout: true };

    return {
        enqueue: enqueue,
        schedule: schedule
    };

    function enqueue(tasks, options) {
        options = options || {};

        var taskRunner = options.taskRunner || iife;
        var args = options.args || [];

        schedule(run.bind(tasks, taskRunner, args), options.timeout | 0);
    }

    function schedule(fn, timeout) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(fn, timeout ? { timeout: timeout } : null);
        } else {
            fn(mockDeadline);
        }
    }

    function run(taskRunner, args, deadline) {
        while((deadline.didTimeout || deadline.timeRemaining() > 0) && this.length) {
            var task = this.shift();
            taskRunner(task, args);
        }

        if (this.length) {
            schedule(run.bind(this, taskRunner, args));
        }
    }

    function iife(fn, args) {
        fn.apply(undefined, args);
    }
});
