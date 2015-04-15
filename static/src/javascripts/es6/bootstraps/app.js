// import crosswords from './crosswords';
// import crosswordThumbnails from 'es6/projects/common/modules/crosswords/thumbnails';
// import domReady from 'domready';

// domReady(() => {
//     crosswords.init();
//     crosswordThumbnails.init();
// });



import raven from 'raven';
import config from 'common/utils/config';
import ab from 'common/modules/experiments/ab';
import images from 'common/modules/ui/images';
import lazyLoadImages from 'common/modules/ui/lazy-load-images';

/* global guardian, console*/

export default ({ isDev, isDiagnosticsLoggingSwitchOn }) => {
    raven.config(
        'http://' + guardian.config.page.sentryPublicApiKey + '@' + guardian.config.page.sentryHost,
        {
            whitelistUrls: [
                // will not actually log errors, but `shouldSendCallback` will be called
                /localhost/,
                /assets\.guim\.co\.uk/,
                /ophan\.co\.uk/
            ],
            tags: {
                edition:        guardian.config.page.edition,
                contentType:    guardian.config.page.contentType,
                revisionNumber: guardian.config.page.revisionNumber
            },
            dataCallback: function(data) {
                if (data.culprit) {
                    data.culprit = data.culprit.replace(/\/[a-z\d]{32}(\/[^\/]+)$/, '$1');
                }
                data.tags.origin = (/j.ophan.co.uk/.test(data.culprit)) ? 'ophan' : 'app';
                return data;
            },
            shouldSendCallback: function(data) {
                if(isDev) {
                    console.error(data);
                }

                return isDiagnosticsLoggingSwitchOn &&
                    Math.random() < 0.2 &&
                    // don't actually notify sentry in dev mode
                    isDev;
            }
        }
    ).install();

    ab.segmentUser();
    ab.run();
    if(guardian.config.page.isFront) {
        if(!document.addEventListener) { // IE8 and below
            window.onload = images.upgradePictures;
        }
    }
    lazyLoadImages.init();
    images.upgradePictures();
    images.listen();

    if (config.switches.commercial) {
        System.import('bootstraps/commercial').then(raven.wrap(
            { tags: { feature: 'commercial' } },
            function (commercial) {
                commercial.init();
            }
        ));
    }

    if (guardian.isModernBrowser) {
        if(isDev) {
            // TODO: Make me work
            // System.import('bootstraps/dev').then(function (devmode) { devmode.init(); });
        }

        System.import('bootstraps/app').then(function(bootstrap) {
            bootstrap.go();
        });
    }
};
