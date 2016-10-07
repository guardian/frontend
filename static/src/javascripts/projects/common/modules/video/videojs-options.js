define(['lodash/objects/assign'], function(assign) {
    var defaults = {
        controls: true,
        textTrackDisplay: false,
        textTrackSettings: false,
        controlBar: {
            children: [
                'playToggle',
                'currentTimeDisplay',
                'timeDivider',
                'durationDisplay',
                'progressControl',
                'fullscreenToggle',
                'volumeMenuButton'
            ]
        },
        // `autoplay` is always set to false.
        // If you are going to set autoplay to any other value, note it breaks
        // `preload="auto"` on < Chrome 35 and `preload="metadata"` on old Safari
        autoplay: false,
        preload: 'metadata',
        techOrder: ['html5']
    };

    return function(overrides) {
        return assign({}, defaults, overrides || {});
    };
});
