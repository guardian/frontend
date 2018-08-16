// @flow strict

import { log } from 'commercial/modules/cmp/log';
import { CmpStore } from 'commercial/modules/cmp/store';
import { getCookie } from 'lib/cookies';
import { getUrlVars } from 'lib/url';
import { vendorList as globalVendorList } from 'commercial/modules/cmp/vendorlist';
import {
    defaultConfig,
    CMP_GLOBAL_NAME,
    CMP_ID,
    CMP_VERSION,
    COOKIE_VERSION,
    COOKIE_NAME,
} from 'commercial/modules/cmp/cmp-env';
import { encodeVendorConsentData } from 'commercial/modules/cmp/cookie';

import type {
    CmpConfig,
    ConsentDataResponse,
    VendorList,
    VendorConsentResponse,
} from 'commercial/modules/cmp/types';

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

const isInEU = (): boolean =>
    (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() === 'EU';

class CmpService {
    isLoaded: boolean;
    cmpReady: boolean;
    cmpConfig: CmpConfig;
    eventListeners: { [string]: Array<(obj: {}) => void> };
    commandQueue: Array<Command>;
    store: CmpStore;
    generateConsentString: () => string;
    processCommand: () => void;

    constructor(store: CmpStore) {
        this.isLoaded = false;
        this.cmpReady = false;
        this.store = store;
        this.commandQueue = [];
        this.eventListeners = {};
        this.processCommand.receiveMessage = this.receiveMessage;
        this.cmpConfig = defaultConfig;
        if (getUrlVars().cmpdebug) {
            this.cmpConfig.logging = 'debug';
            log.info('Set logging level to DEBUG');
        }
        if (isInEU()) {
            this.cmpConfig.gdprApplies = true;
        }
    }

    generateConsentString = () => {
        const { vendorConsentData, vendorList } = this.store;

        if (this.store.vendorConsentData && this.store.vendorList) {
            log.info(
                'GenerateConsentString: Persisted vendor consent data found'
            );
            // the encoding can fail if the format of the persisted data is incorrect!
            // TODO: Zero trust! we need to catch any errors, and log them...
            return encodeVendorConsentData({
                ...vendorConsentData,
                vendorList,
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
            const { vendorList } = this.store;
            const { vendorListVersion: listVersion } = vendorList || {};
            // flowlint sketchy-null-number:warn
            if (!vendorListVersion || vendorListVersion === listVersion) {
                callback(vendorList, true);
            } else {
                callback(null, false);
            }
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
                    'unkonwn'}`
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
            const { __cmpCall: cmp }: MessageData = data;
            if (cmp) {
                log.info(`Message from: ${origin}`);
                const { callId, command, parameter } = cmp;
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
    if (window[CMP_GLOBAL_NAME]) {
        // Pull queued commands from the CMP stub
        const { commandQueue = [] } = window[CMP_GLOBAL_NAME] || {};
        // Initialize the store with all of our consent data
        const store = new CmpStore(
            CMP_ID,
            CMP_VERSION,
            COOKIE_VERSION,
            readConsentCookie(COOKIE_NAME),
            globalVendorList
        );
        const cmp = new CmpService(store);
        // Expose `processCommand` as the CMP implementation
        window[CMP_GLOBAL_NAME] = cmp.processCommand;
        cmp.commandQueue = commandQueue;
        cmp.isLoaded = true;
        cmp.notify('isLoaded');
        // Execute any previously queued command
        cmp.processCommandQueue();

        cmp.cmpReady = true;
        cmp.notify('cmpReady');
    }
};

export const _ = { CmpService, readConsentCookie };
