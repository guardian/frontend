import domready from 'domready';
import raven from 'common/utils/raven';
import bootStandard from 'bootstraps/standard/main';

domready(() => {
    const guardian = window.guardian;
    const config = guardian.config;

    // 1. boot standard, always
    bootStandard();

    // 2. once standard is done, next is commercial
    if (config.switches.commercial) {
        if (config.page.isDev) {
            guardian.adBlockers.onDetect.push((isInUse) => {
                const needsMessage = isInUse && window.console && window.console.warn;
                const message = 'Do you have an adblocker enabled? Commercial features might fail to run, or throw exceptions.';
                if (needsMessage) {
                    window.console.warn(message);
                }
            });
        }

        require(['bootstraps/commercial'], raven.wrap({
            tags: {
                feature: 'commercial',
            },
        }, commercial => commercial.init()));
    }

    // 3. finally, try enhanced
    if (guardian.isEnhanced) {
        require(['bootstraps/enhanced/main'], (bootEnhanced) => {
            bootEnhanced();
        });
    }
});
