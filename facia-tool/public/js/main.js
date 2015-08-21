/* global System */
import ko from 'knockout';
import Raven from 'raven-js';
import Bootstrap from 'modules/bootstrap';
import 'font-awesome/css/font-awesome.min.css!';
import logger from 'utils/logger';
import oauthSession from 'utils/oauth-session';
import Router from 'modules/router';
import handlers from 'modules/route-handlers';

var router, bootstrap;

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

function loadApp (res) {
    var model = router.load(res);
    ko.applyBindings(model);
    model.loaded.then(() => {
        bootstrap.every(function (updatedRes) {
            model.update(updatedRes);
        });
        model.on('config:needs:update', callback => {
            bootstrap.get().onload(callback).onfail(callback);
        });
        oauthSession();
    });
}

router = new Router(handlers);

bootstrap = new Bootstrap()
    .onload(checkEnabled)
    .onload(registerRaven)
    .onload(loadApp)
    .onfail(terminate);
