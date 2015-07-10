// 'older' iOS normally indicates a device with lower power (they stop being upgradeable at some point).
// We won't run all javascript on these.
// For usage stats see http://david-smith.org/iosversionstats/
//
// NOTE: this moves people into a category where they do not get important things such as commenting
//
// olderIPadOnFront is set in the scala

var isOlderDevice = (function() {
    if (navigator.platform === 'iPhone' || navigator.platform === 'iPad' || navigator.platform === 'iPod') {
        // I'm intentionally being a bit over zealous in the detection department here
        return /.*(iPhone|iPad; CPU) OS ([3456])_\d+.*/.test(navigator.userAgent) || olderIPadOnFront;
    }
    return false;
})();
