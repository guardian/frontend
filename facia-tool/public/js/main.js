/* global System */
import Raven from 'raven-js';
import Bootstrap from 'modules/bootstrap';
import 'font-awesome/css/font-awesome.min.css!';
import {init, update, differs} from 'modules/vars';
import logger from 'utils/logger';
import oauthSession from 'utils/oauth-session';

function terminate (error) {
    if (error) {
        logger.error(error);
        window.alert(error);
    }
    window.location.href = '/logout';
}

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
        var originalConsole = window.console.error;
        window.console.error = function () {
            originalConsole.apply(window.console, arguments);
            Raven.captureMessage([].slice.apply(arguments).join(' '));
        };
    }
}

export default function load (ModuleClass) {
    var module, bootstrap;

    function updateModuleConfig (res) {
        if (differs(res)) {
            update(res);
            module.update(res);
        }
    }

    function loadModule (res) {
        init(res);

        module = new ModuleClass();
        module.init(bootstrap, res);
        update(res);
        bootstrap.every(updateModuleConfig);
        oauthSession();
    }

    bootstrap = new Bootstrap()
        .onload(checkEnabled)
        .onload(registerRaven)
        .onload(loadModule)
        .onfail(terminate);
}
