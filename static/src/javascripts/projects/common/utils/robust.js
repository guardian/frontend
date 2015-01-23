/*jshint -W024 */
define([
    'raven',
    'Promise'
], function (
    raven,
    Promise
) {

    /*
    * This purposefully does not return the Promise.
    * It is designed to swallow and report on exceptions at a high level.
    * If you need to act on the return value you are looking for a different abstraction
    * */
    function Robust(name, block, reporter) {

        if (!reporter) {
            reporter = raven.captureException;
        }

        new Promise(function (resolve, reject) {
            try {
                block();
                resolve();
            } catch (e) {
                reject(e);
            }
        }).catch(function (e) {
            reporter(e, { tags: { module: name } });
        });
    }

    return Robust;

});
