/* global console */
import Raven from 'raven-js';

export function load (module) {

    System.amdRequire(['config'], function (config) {
        Raven.config(config.sentryPublicDSN).install();
        Raven.setUser({
            email: config.email || 'anonymous'
        });

        System.amdDefine = Raven.wrap({deep: false}, System.amdDefine);
        // ES6 loader uses console.error to log un-handled rejected promises
        window.console.error = function () {
            Raven.captureMessage([].slice.apply(arguments).join(' '));
        };


        System.amdRequire(['models/' + module + '/main'], function (Module) {
            new Module().init();
        }, function (error) {
            Raven.captureException(error);
            console.error(error);
        });
    });
}
