// @flow
import { getCookie } from 'lib/cookies';
import { log } from 'commercial/modules/cmp/log';
import { vendorList as globalVendorList } from 'commercial/modules/cmp/vendorlist';
import { defaultConfig, CMP_GLOBAL_NAME } from 'commercial/modules/cmp/cmp-env';
import {
    encodeVendorConsentData,
    decodeVendorConsentData,
    generateVendorData,
} from 'commercial/modules/cmp/cookie';

import type {
    CmpConfig,
    VendorList,
    Store,
} from 'commercial/modules/cmp/types';

const readConsentCookie = (cookieName: string): ?boolean => {
    const cookieVal: ?string = getCookie(cookieName);
    if (cookieVal && cookieVal.split(',')[0] === '1') return true;
    if (cookieVal && cookieVal.split(',')[0] === '0') return false;
    return null;
};

const generateStore = (vendorList: VendorList): Store => {
    // if cookie is set get the first value of the CSL to interpret later...
    const allowedVendors: Array<number> = vendorList.vendors.map(_ => _.id);
    const canPersonalise = readConsentCookie('GU_TK');

    const store: Store = {
        vendorList,
        allowedVendorIds: allowedVendors,
    };

    if (typeof canPersonalise === 'boolean') {
        const consentSelection = generateVendorData(
            canPersonalise,
            store.vendorList
        );
        // encode and decode becuase this
        const encoded = encodeVendorConsentData(consentSelection);
        store.persistedVendorConsentData = decodeVendorConsentData(encoded);
    }
    return store;
};

/* fam, I am not talking about that config... */
/* eslint-disable guardian-frontend/no-direct-access-config */
class CmpService {
    isLoaded: ?boolean;
    cmpReady: ?boolean;
    config: CmpConfig;
    eventListeners: ?any;
    commandQueue: Array<any>;
    store: Store;
    generateConsentString: () => string;
    getVendorConsentsObject: () => void;
    processCommand: () => void;

    constructor(store: Store) {
        this.isLoaded = false;
        this.cmpReady = false;
        this.config = defaultConfig;
        this.eventListeners = {};
        this.store = store;
        this.commandQueue = [];
    }

    generateConsentString = () => {
        const { persistedVendorConsentData, vendorList } = this.store;

        if (persistedVendorConsentData && vendorList) {
            log.info('persisted vendor consent data found');
            // the encoding can fail if the format of the persisted data is incorrect!
            // TODO: Zero trust! we need to catch any errors, and log them...
            return encodeVendorConsentData({
                ...persistedVendorConsentData,
                vendorList,
            });
        }
        // else...
        // TODO: if the persisted data is missing we will need to generate it
        log.info('no vendor consent data found');
        // however, if the consent is null, we should fail...
        // The API spec suggests vendors use a timeout in case data is missing.
    };

    getVendorConsentsObject = (vendorIds: ?Array<number>) => {
        return { vendorIds };
    };

    commands = {
        getVendorConsents: (vendorIds: ?Array<number>, callback = () => {}) => {
            const consent = {
                metadata: this.generateConsentString(),
                gdprApplies: this.config.gdprApplies,
                hasGlobalScope: this.config.storeConsentGlobally,
                ...this.getVendorConsentsObject(vendorIds),
            };

            callback(consent, true);
        },

        getConsentData: (_, callback = () => {}): void => {
            const consentData = {
                gdprApplies: this.config.gdprApplies,
                hasGlobalScope: this.config.storeConsentGlobally,
                consentData: this.generateConsentString(),
            };
            callback(consentData, true);
        },

        getVendorList: (vendorListVersion, callback = () => {}): void => {
            const { vendorList } = this.store;
            const { vendorListVersion: listVersion } = vendorList || {};
            if (!vendorListVersion || vendorListVersion === listVersion) {
                callback(vendorList, true);
            } else {
                callback(null, false);
            }
        },

        ping: (_, callback = () => {}): void => {
            const result = {
                gdprAppliesGlobally: this.config.storeConsentGlobally,
                cmpLoaded: true,
            };
            callback(result, true);
        },
    }

    processCommand = (command: string, parameter: any, callback: any): void => {
        if (typeof this.commands[command] !== 'function') {
            log.error(`Invalid CMP command "${command}"`);
        } else if (
            !this.store.persistedVendorConsentData &&
            (command === 'getVendorConsents' || command === 'getConsentData')
        ) {
            // Special case where we have the full CMP implementation loaded but
            // we still queue these commands until there is data available.
            log.info(
                `Queuing command: ${command} until consent data is available`
            );
            this.commandQueue.push({
                command,
                parameter,
                callback,
            });
        } else {
            log.info(`Proccess command: ${command}, parameter: ${parameter}`);
            this.commands[command](parameter, callback);
        }
    };

    processCommandQueue = () => {
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

    receiveMessage = ({ data, origin, source }) => {
        const { __cmpCall: cmp } = data;
        if (cmp) {
            const { callId, command, parameter } = cmp;
            this.processCommand(command, parameter, returnValue =>
                source.postMessage(
                    { __cmpReturn: { callId, command, returnValue } },
                    origin
                )
            );
        }
    };

    notify = (event: string, data: any): void => {
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
    // Pull queued command from __cmp stub
    const { commandQueue = [] } = window[CMP_GLOBAL_NAME] || {};
    // init the CmpService with a generated store of data...
    const cmp = new CmpService(generateStore(globalVendorList));
    // Expose `processCommand` as the CMP implementation
    window[CMP_GLOBAL_NAME] = cmp.processCommand;
    // Notify listeners that the CMP is loaded
    log.debug(`Successfully loaded CMP`);
    cmp.isLoaded = true;
    cmp.notify('isLoaded');
    // Execute any previously queued command
    cmp.commandQueue = commandQueue;
    cmp.processCommandQueue();
};

export const _ = { CMP_GLOBAL_NAME, CmpService, generateStore };
