// @flow
import fastdom from 'fastdom';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import template from 'lodash/utilities/template';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';
import commercialFeatures from 'commercial/modules/commercial-features';
import plistaStr from 'raw-loader!commercial/views/plista.html';
import { loadScript } from 'lib/load-script';

const plistaTpl = template(plistaStr);
const selectors = {
    container: '.js-plista-container',
};

const module = {};

const loadInstantly = function() {
    return detect.adblockInUse.then(
        adblockInUse =>
            !document.getElementById('dfp-ad--merchandising-high') ||
            adblockInUse
    );
};

// a modification of the code provided by Plista; altered to be a lazy load rather than during DOM construction
const embed = function(publickey, widgetName, geo, u, categories) {
    const name = `PLISTA_${publickey}`;
    const lib = window[name];
    const $container = $(selectors.container);

    $container.append(
        plistaTpl({
            widgetName,
        })
    );
    $container.css('display', 'block');

    if (!lib || !lib.publickey) {
        window[name] = {
            publickey,
            widgets: [
                {
                    name: widgetName,
                    pre: u,
                },
            ],
            geo,
            categories,
            dataMode: 'data-display',
        };
        loadScript(`//static-au.plista.com/async/${name}.js`);
    } else {
        lib.widgets.push({
            name: widgetName,
            pre: u,
        });
    }
};

module.load = function() {
    fastdom.write(() => {
        embed(config.page.plistaPublicApiKey, 'innerArticle', 'au');
    });
};

module.init = function() {
    if (commercialFeatures.outbrain) {
        return loadInstantly().then(adBlockInUse => {
            if (adBlockInUse) {
                module.load();
            } else {
                return trackAdRender(
                    'dfp-ad--merchandising-high'
                ).then(isLoaded => {
                    if (!isLoaded) {
                        module.load();
                    }
                });
            }
        });
    }
    return Promise.resolve(false);
};

export default module;
