define(function() {
    return function(observableArray, id) {
        return observableArray.remove(function(item) {
            return item.id === id;
        })[0];
    };
});
