define(function () {
    return takeWhile;

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
