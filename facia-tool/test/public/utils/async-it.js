define([
    'test/utils/collections-loader'
], function(
    loader
){
    // Redefine the 'it' method so it waits for the loader
    return function (description, test) {
        it(description, function (done) {
            loader.then(function () {
                test(done);
            });
        });
    };
});
