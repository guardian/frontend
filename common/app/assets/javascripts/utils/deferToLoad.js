define(function() {

function deferToLoad(ref) {
    if (document.readyState === 'complete') {
        ref();
    } else {
        window.addEventListener('load', function() {
            ref();
        });
    }
}
return deferToLoad;

}); // define