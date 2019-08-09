// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import reportError from 'lib/report-error';
import { local } from 'lib/storage';

let numRetries = 0;

const configureSegments = () => {
    if (window.Krux) {
        // For flag values, see https://konsole.zendesk.com/hc/en-us/articles/360000754674-JavaScript-Consent-Tag-Spec
        const consentFlags = {
            dc: true,
            al: true,
            tg: true,
            cd: false,
            sh: false,
            re: false,
        };
        window.Krux('consent:set', consentFlags, ex => {
            if (ex) {
                switch (ex.idv) {
                    case 'no identifier found for user':
                    case 'user opted out via (optout or dnt)':
                        break; // swallow these as they're harmless
                    default: {
                        const exStr = Object.keys(ex)
                            .map(prop => `${prop} -> '${ex[prop]}'`)
                            .join(', ');
                        const msg = `KRUX: ${exStr}`;
                        reportError(new Error(msg), {
                            feature: 'krux:consent:set',
                            consentFlags,
                        });
                    }
                }
            }
        });
    } else if (numRetries < 20) {
        // give up to 2s for slow networks
        numRetries += 1;
        setTimeout(() => {
            configureSegments();
        }, 100);
    }
};

const onLoad = () => {
    configureSegments();
};

const retrieve = (n: string): string => {
    const k: string = `kx${n}`;

    return local.getRaw(k) || getCookie(`${k}=([^;]*)`) || '';
};

export const getKruxSegments = (
    adConsentState: boolean | null
): Array<string> => {
    const segments: string = adConsentState !== false ? retrieve('segs') : '';
    return segments ? segments.split(',') : [];
};

export const krux: ThirdPartyTag = {
    shouldRun: config.get('switches.krux', false),
    url: '//cdn.krxd.net/controltag?confid=JVZiE3vn',
    onLoad,
};
