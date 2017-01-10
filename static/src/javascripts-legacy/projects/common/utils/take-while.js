define(function () {
    return takeWhile;

    /**
     * Returns a subset of arr from the beginning until the first element x
     * where f(x) is false (not included).
     */
    function takeWhile(f, arr) {
        var i = -1;
        var size = arr.length;
        var taking;

        do {
            i += 1;
            taking = i < size && f(arr[i], i, arr);
        } while (taking);

        return arr.slice(0, i);
    }
});
