define(function() {
    return function(observableArray, id) {
        observableArray.remove(function(item) {
            return item.id === id;
        });
    };
});
