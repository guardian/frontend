define(function() {

function deferToLoad(ref) {
    ref();
}
return deferToLoad;

}); // define