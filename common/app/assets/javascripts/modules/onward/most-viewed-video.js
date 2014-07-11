/*
 Module: most-viewed-video.js
 Description: Shows most popular videos across the whole site.
 */
define([
    'qwery',
    'lodash/objects/assign',
    'common/modules/component',
    'common/modules/analytics/register'
], function (
    qwery,
    extend,
    Component,
    register
    ) {

    function MostViewedVideo() {
        register.begin('most-viewed-video');
        this.fetch(qwery('.js-video-components-container'), 'html');
    }

    Component.define(MostViewedVideo);

    MostViewedVideo.prototype.endpoint = '/video/most-viewed.json';

    MostViewedVideo.prototype.ready = function() {
        register.end('most-viewed-video');
    };

    return MostViewedVideo;
});