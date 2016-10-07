define([], function () {
    function startTimer(duration, func) {
        var seconds = duration;
        var timer = setInterval(function () {
            func(seconds);
            if (--seconds < 0) {
                clearInterval(timer);
            }
        }, 1000);
    }

    return {
        startTimer: startTimer
    };

});
