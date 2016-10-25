function resize() {
    window.frameElement.height = document.body.offsetHeight;
}
window.addEventListener('resize', resize);
resize();
