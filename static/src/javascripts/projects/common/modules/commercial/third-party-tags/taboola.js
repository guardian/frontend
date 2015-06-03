define([
    'common/utils/config'
], function (config) {

    function load() {
        if (config.switches.taboola) {
            window._taboola = window._taboola || [];
            _taboola.push({article:'auto'});
            require(['js!' + '//cdn.taboola.com/libtrc/theguardian/loader.js']);
            _taboola.push({
                mode: 'thumbnails-a',
                container: 'taboola',
                placement: 'Below Article Thumbnails',
                target_type: 'mix'
            });
            _taboola.push({flush: true});
        }
    }

    return {
        load: load
    };
});
