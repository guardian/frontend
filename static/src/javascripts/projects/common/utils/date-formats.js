define([], function () {
    /**
     * e.g., 5th February, 1987 (birth date of the great Robert James Berry), would be represented as 1987/02/05.
     */
    function utcDateString(date) {
        return new Date(date).toISOString().substr(0, 10).replace(/-/g, '/');
    }

    return {
        utcDateString: utcDateString
    };
});
