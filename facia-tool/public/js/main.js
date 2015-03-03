/* global console */
/* global System */
import Raven from 'raven-js';
import Bootstrap from 'modules/bootstrap';
import 'font-awesome/css/font-awesome.min.css!';
import vars from 'modules/vars';

export function load (moduleName) {
    var module, bootstrap;

    function checkEnabled (res) {
        if (res.switches['facia-tool-disable']) {
            terminate();
        }
    }

    function registerRaven (res) {
        if (!res.defaults.dev) {
            Raven.config(res.defaults.sentryPublicDSN).install();
            Raven.setUser({
                email: res.defaults.email || 'anonymous'
            });
            System.amdDefine = Raven.wrap({deep: false}, System.amdDefine);
            // ES6 loader uses console.error to log un-handled rejected promises
            window.console.error = function () {
                Raven.captureMessage([].slice.apply(arguments).join(' '));
            };
        }
    }

    function loadModule (res) {
        vars.update(res);

        System.amdRequire(['models/' + moduleName + '/main'], function (Module) {
            module = new Module();
            module.init(bootstrap. res);

            bootstrap.every(updateModuleConfig);
        }, function (error) {
            console.error(error);
        });
    }

    function updateModuleConfig (res) {
        module.update(res);
    }

    function terminate (error) {
        if (error) {
            console.error(error);
            window.alert(error);
        }
        window.location.href = '/logout';
    }

    bootstrap = new Bootstrap()
        .onload(checkEnabled)
        .onload(registerRaven)
        .onload(loadModule)
        .onfail(terminate);
}
