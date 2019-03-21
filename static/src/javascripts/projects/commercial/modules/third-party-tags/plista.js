// @flow

import fastdom from 'fastdom';
import $ from 'lib/$';
import config from 'lib/config';
import { adblockInUse as adblockInUse_ } from 'lib/detect';
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { loadScript } from 'lib/load-script';

const adblockInUse: any = adblockInUse_;

const plistaTpl = ({ widgetName }) => `
    <div class="PLISTA" data-ob-template="guardian">
        <div data-display="plista_widget_${widgetName}"></div>
    </div>
`;

const selectors = {
    container: '.js-plista-container',
};

const module = {};

const loadInstantly = function() {
    return adblockInUse.then(
        inUse => !document.getElementById('dfp-ad--merchandising-high') || inUse
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
        embed(config.get('page.plistaPublicApiKey'), 'innerArticle', 'au');
    });
};

module.init = function(): Promise<false> {
    if (commercialFeatures.outbrain) {
        return loadInstantly().then(inUse => {
            if (inUse) {
                module.load();
            } else {
                return trackAdRender('dfp-ad--merchandising-high').then(
                    isLoaded => {
                        if (!isLoaded) {
                            module.load();
                        }
                    }
                );
            }
        });
    }

    return Promise.resolve(false);
};

export { module as plista };
