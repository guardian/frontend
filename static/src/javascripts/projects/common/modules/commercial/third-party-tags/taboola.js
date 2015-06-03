define([
    'common/utils/config'
], function (config) {

    function load() {
        if (config.switches.taboola) {
            //jscs:disable disallowDanglingUnderscores
            window._taboola = window._taboola || [];
            window._taboola.push({article: 'auto'});
            require(['js!' + '//cdn.taboola.com/libtrc/theguardian/loader.js']);
            //jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            window._taboola.push({
                mode: 'thumbnails-a',
                container: 'taboola',
                placement: 'Below Article Thumbnails',
                target_type: 'mix'
            });
            //jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            window._taboola.push({flush: true});
            //jscs:enable disallowDanglingUnderscores
        }
    }

    return {
        load: load
    };
});
