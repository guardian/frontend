// @flow strict

import { cmp, oldCmp } from '@guardian/consent-management-platform';

import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { getUrlVars } from 'lib/url';
import fetchJSON from 'lib/fetch-json';
import { isCcpaApplicable } from 'commercial/modules/cmp/ccpa-cmp';
import { log } from './log';
import { CmpStore } from './store';
import { encodeVendorConsentData } from './cookie';

// Avoid Flow and eslint to complain about this import not being available
// in a fresh checkout.
// See tools/tools/__tasks__/compile/data/aib_cmp.js to understand
// $FlowFixMe
import { shortVendorList as shortVendorListData } from './vendorlist'; // eslint-disable-line import/no-unresolved

import {
    defaultConfig,
    CMP_GLOBAL_NAME,
    CMP_ID,
    CMP_VERSION,
    COOKIE_VERSION,
    COOKIE_NAME,
} from './cmp-env';

import type {
    CmpConfig,
    ConsentDataResponse,
    VendorList,
    VendorConsentResponse,
} from './types';
import { isInTcfv2Test } from './tcfv2-test';

const onIabConsentNotification = isInTcfv2Test()
    ? cmp.onConsentChange
    : oldCmp.onIabConsentNotification;

type MessageData = {
    __cmpCall: ?{
        callId: string,
        command: string,
        parameter: string,
    },
};

type PingResponse = {
    cmpLoaded: boolean,
    gdprAppliesGlobally: boolean,
};

type CommandCallback = (
    res: VendorConsentResponse | ConsentDataResponse | PingResponse,
    ok?: boolean
) => void;

type Command = {
    callId: string,
    command: string,
    parameter: string,
    callback: CommandCallback,
    event: MessageEvent,
};

const readConsentCookie = (cookieName: string): boolean | null => {
    const cookieVal: ?string = getCookie(cookieName);
    // flowlint sketchy-null-string:warn
    if (cookieVal && cookieVal.split('.')[0] === '1') return true;
    if (cookieVal && cookieVal.split('.')[0] === '0') return false;
    return null;
};

const generateStore = (): CmpStore => {
    const store = new CmpStore(
        CMP_ID,
        CMP_VERSION,
        COOKIE_VERSION,
        readConsentCookie(COOKIE_NAME),
        shortVendorListData
    );
    return store;
};

class CmpService {
    isLoaded: boolean;
    cmpReady: boolean;
    cmpConfig: CmpConfig;
    eventListeners: { [string]: Array<(obj: {}) => void> };
    commandQueue: Array<Command>;
    store: CmpStore;
    generateConsentString: () => string;
    processCommand: () => void;

    constructor(
        store: CmpStore,
        eventListeners: { [string]: Array<(obj: {}) => void> }
    ) {
        this.isLoaded = false;
        this.cmpReady = false;
        this.store = store;
        this.commandQueue = [];
        this.eventListeners = eventListeners;
        this.processCommand.receiveMessage = this.receiveMessage;
        this.cmpConfig = defaultConfig;
        if (getUrlVars().cmpdebug) {
            this.cmpConfig.logging = 'debug';
            log.info('Set logging level to DEBUG');
        }
    }

    generateConsentString = () => {
        const { vendorConsentData, shortVendorList } = this.store;

        if (this.store.vendorConsentData && this.store.shortVendorList) {
            log.info(
                'GenerateConsentString: Persisted vendor consent data found'
            );
            // the encoding can fail if the format of the persisted data is incorrect!
            // TODO: Zero trust! we need to catch any errors, and log them...
            return encodeVendorConsentData({
                ...vendorConsentData,
                shortVendorList,
            });
        }
        // TODO: if the persisted data is missing we will need to generate it
        log.info('GenerateConsentString: No vendor consent data found');
        // however, if the consent cookie is missing, we should return nothing.
        // The API spec suggests vendors use a timeout in case data is missing.
    };

    commands = {
        getVendorConsents: (
            vendorIds: ?Array<number>,
            callback: CommandCallback = () => {}
        ): void => {
            const consent = this.store.getVendorConsentsObject(vendorIds) || {};
            const result: VendorConsentResponse = {
                gdprApplies: this.cmpConfig.gdprApplies,
                hasGlobalScope: this.cmpConfig.storeConsentGlobally,
                metadata: this.generateConsentString() || undefined,
                ...consent,
            };
            callback(result, true);
        },

        getConsentData: (
            _: mixed,
            callback: CommandCallback = () => {}
        ): void => {
            const consentData: ConsentDataResponse = {
                gdprApplies: this.cmpConfig.gdprApplies,
                hasGlobalScope: this.cmpConfig.storeConsentGlobally,
                consentData: this.generateConsentString() || undefined,
            };
            callback(consentData, true);
        },

        getVendorList: (
            vendorListVersion: number | null,
            callback: (res: VendorList | null, ok: boolean) => void = () => {}
        ): void => {
            fetchJSON(config.get('libs.cmp.fullVendorDataUrl'), {
                mode: 'cors',
            })
                .then(vendorList => {
                    const { vendorListVersion: listVersion } = vendorList || {};
                    // flowlint sketchy-null-number:warn
                    if (
                        !vendorListVersion ||
                        vendorListVersion === listVersion
                    ) {
                        callback(vendorList, true);
                    } else {
                        callback(null, false);
                    }
                })
                .then(undefined, err => {
                    log.error('ERROR fetching fullvendorlist: ', err);
                    callback(null, false);
                });
        },

        ping: (_: mixed, callback: CommandCallback = () => {}): void => {
            const result = {
                gdprAppliesGlobally: this.cmpConfig.storeConsentGlobally,
                cmpLoaded: true,
            };
            callback(result, true);
        },

        addEventListener: (
            event: string,
            callback: (res: {}) => void
        ): void => {
            const eventSet = this.eventListeners[event] || [];
            eventSet.push(callback);
            this.eventListeners[event] = eventSet;
            if (event === 'isLoaded' && this.isLoaded) {
                callback({ event });
            }
            if (event === 'cmpReady' && this.cmpReady) {
                callback({ event });
            }
        },
    };

    processCommand = (
        command: string,
        parameter: string | null,
        callback: CommandCallback = () => {}
    ): void => {
        if (typeof this.commands[command] !== 'function') {
            log.error(`Invalid CMP command "${command}"`);
        } else {
            log.info(
                `Proccess command: ${command}, parameter: ${parameter ||
                    'unknown'}`
            );
            this.commands[command](parameter, callback);
        }
    };

    processCommandQueue = (): void => {
        const queue = [...this.commandQueue];
        if (queue.length) {
            log.info(`Process ${queue.length} queued commands`);
            this.commandQueue = [];
            queue.forEach(({ callId, command, parameter, callback, event }) => {
                if (event) {
                    this.processCommand(command, parameter, returnValue =>
                        event.source.postMessage(
                            {
                                __cmpReturn: {
                                    callId,
                                    command,
                                    returnValue,
                                },
                            },
                            event.origin
                        )
                    );
                } else {
                    this.processCommand(command, parameter, callback);
                }
            });
        }
    };

    receiveMessage = ({ data, origin, source }: MessageEvent): void => {
        if (data instanceof Object) {
            const { __cmpCall: cmpSource }: MessageData = data;
            if (cmpSource) {
                log.info(`Message from: ${origin}`);
                const { callId, command, parameter } = cmpSource;
                if (source && source.postMessage) {
                    this.processCommand(command, parameter, returnValue =>
                        source.postMessage(
                            { __cmpReturn: { callId, command, returnValue } },
                            origin
                        )
                    );
                } else {
                    log.debug(
                        `Missing source: Unable to process command from ${origin}`
                    );
                }
            }
        }
    };

    notify = (event: string, data?: MessageData): void => {
        log.info(`Notify event: ${event}`);
        const eventSet = this.eventListeners[event] || [];
        eventSet.forEach(listener => {
            listener({ event, data });
        });
        // Process any queued commands that were waiting for consent data
        if (event === 'onSubmit') {
            this.processCommandQueue();
        }
    };
}

export const init = (): void => {
    // Only run our CmpService if prepareCmp has added the CMP stub
    if (window[CMP_GLOBAL_NAME] && !isCcpaApplicable() && !isInTcfv2Test()) {
        let cmpService: ?CmpService;
        // Pull queued commands from the CMP stub
        const { commandQueue = [] } = window[CMP_GLOBAL_NAME] || {};

        /**
         * Call onIabConsentNotification with callback, this will
         * trigger the callback immediately and set up cmp with the initial consent
         * state. If consent state updates via the UI the callback will be triggered
         * again which will update cmp with the new consent state.
         */
        onIabConsentNotification(() => {
            // Initialize the store with all of our consent data
            const store = generateStore();
            /**
             * If instance of cmpService exists get it's eventListeners
             * as we'll need to add them to the new instance of cmp.
             */
            const eventListeners = cmpService ? cmpService.eventListeners : {};

            // Create new instance of CmpService and assign to cmp
            cmpService = new CmpService(store, eventListeners);

            // Set window[CMP_GLOBAL_NAME] to new `cmp.processCommand`
            window[CMP_GLOBAL_NAME] = cmpService.processCommand;
        });

        // Just required when we first initialise cmp on page load
        if (cmpService) {
            cmpService.commandQueue = commandQueue;
            cmpService.isLoaded = true;
            cmpService.notify('isLoaded');
            // Execute any previously queued command
            cmpService.processCommandQueue();
            cmpService.cmpReady = true;
            cmpService.notify('cmpReady');
        }
    }
};

export const _ = { CmpService, readConsentCookie };
