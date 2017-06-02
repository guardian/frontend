// @flow
import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { buildPageTargeting } from 'commercial/modules/build-page-targeting';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import once from 'lodash/functions/once';

// Wrap the native implementation of getOwnPropertyNames in a try-catch. If any polyfill attempts
// to re-implement this function, and doesn't consider the "access permissions" issue that exists in IE11,
// then the resulting "Access Denied" error will be caught. Without this, the error is always delivered to Sentry,
// but does not pass through window.onerror. More info here: https://github.com/paulmillr/es6-shim/issues/333
const catchPolyfillErrors = () => {
    // Skip polyfill error-catch in dev environments.
    if (config.page.isDev) {
        return;
    }

    const nativeGetOwnPropertyNames: (obj: any) => Array<string> =
        Object.getOwnPropertyNames;
    // Cast to any to workaround Flow warning:
    // covariant property incompatible with contravariant use in assignment of property.
    (Object: any).getOwnPropertyNames = (obj: any): Array<string> => {
        try {
            return nativeGetOwnPropertyNames(obj);
        } catch (e) {
            // continue regardless of error
            return [];
        }
    };
};

const setupSonobi: () => Promise<void> = once(() => {
    buildPageTargeting();
    // Setting the async property to false will _still_ load the script in
    // a non-blocking fashion but will ensure it is executed before googletag
    return loadScript(config.libs.sonobi, { async: false }).then(
        catchPolyfillErrors
    );
});

const init = (start: () => void, stop: () => void) => {
    if (dfpEnv.sonobiEnabled && commercialFeatures.dfpAdvertising) {
        start();
        setupSonobi().then(stop);
    }

    return Promise.resolve();
};

export { setupSonobi };

export default {
    init,
};
