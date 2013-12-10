define(function() {

function toArray(list) {
    return Array.prototype.slice.call(list);
}
return toArray;

}); // define