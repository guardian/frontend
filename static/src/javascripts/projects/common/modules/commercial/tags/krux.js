define([
    'common/utils/config'
], function (
    config
) {
    function load() {
        if (config.switches.krux) {
            userTiming.mark('Krux Begin');
            return require(['js!' + '//cdn.krxd.net/controltag?confid=JVZiE3vn']);
        }
    }

    return {
        load: load
    };

});
