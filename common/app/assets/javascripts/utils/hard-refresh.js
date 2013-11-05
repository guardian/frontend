define(function () {

function hardRefresh(e) {
    // this means it will not load from the cache
    if (e) {
        e.preventDefault();
    }
    location.reload(true);
}
return hardRefresh;

}); // define
