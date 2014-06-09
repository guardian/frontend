/* jshint unused: false */
define([
    'vast',
    'videojs',
    'videojsads',
    'videojsvast'
], function(
    vast,
    videojs,
    videojsads,
    videojsvast
) {

    window.DMVAST = vast;

    videojsads();
    videojsvast();

    return;
});