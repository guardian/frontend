define(function () {
    return dropWhile;

    function dropWhile(f, arr) {
        var i = -1;
        var size = arr.length;
        var dropping;

        do {
            i += 1;
            dropping = i < size && f(arr[i], i, arr);
        } while (dropping);

        return arr.slice(i);
    }

});
