define([], function () {
    function utcDateString(date) {
        return new Date(date).toISOString().substr(0, 10).replace(/-/g, '/');
    }

    return {
        utcDateString: utcDateString
    };
});
