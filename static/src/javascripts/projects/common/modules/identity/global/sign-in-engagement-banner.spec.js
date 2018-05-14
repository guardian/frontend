// @flow
import { getCookie as getCookie_ } from 'lib/cookies';
import { Message as Message_ } from 'common/modules/ui/message';
import userPrefs_ from 'common/modules/user-prefs';
import {
    signInEngagementBanner,
    sessionVisitsKey,
    lifeTimeViewsKey,
    lastSeenAtKey,
} from 'common/modules/identity/global/sign-in-engagement-banner';
import { bindableClassNames } from 'common/modules/identity/global/sign-in-engagement-banner/template';

const show = signInEngagementBanner.show;
const canShow = signInEngagementBanner.canShow;

const getCookie: any = getCookie_;
const userPrefs: any = userPrefs_;
const Message: any = Message_;

const validGaCookie = 'GA1.2.xx.1524903850';
const newGaCookie = 'GA1.2.xx.1525096983';

const timestampToday = 1525096983756;
const timestampThreeDaysAgo = 1524837783756;

const passingStore = _ => {
    if (_ === sessionVisitsKey) return 4;
    else if (_ === lifeTimeViewsKey) return 1;
    return timestampThreeDaysAgo;
};

jest.spyOn(Date, 'now').mockImplementation(() => timestampToday);

jest.useFakeTimers();

jest.mock('lib/mediator');
jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));
jest.mock('lib/storage', () => ({
    local: {
        get: jest.fn(() => 10),
        set: jest.fn(),
        isAvailable: jest.fn(),
    },
}));
jest.mock('common/modules/user-prefs', () => ({
    get: jest.fn(() => null),
    set: jest.fn(),
}));
jest.mock('lib/cookies', () => ({
    getCookie: jest.fn(() => null),
}));

jest.mock('common/modules/experiments/test-can-run-checks', () => ({
    testCanBeRun: jest.fn(() => true),
}));
jest.mock('common/modules/ui/message', () => ({
    Message: jest.fn(),
}));
jest.mock('lib/url', () => ({
    constructQuery: jest.fn(() => ''),
}));
jest.mock('lib/config', () => ({
    get: jest.fn(() => ''),
}));
jest.mock('common/modules/experiments/utils', () => ({
    getVariant: jest.fn(() => ({})),
    isInVariant: jest.fn(() => true),
}));

beforeEach(() => {
    Message.mockReset();
    Message.prototype.show = jest.fn(() => true);
    userPrefs.get.mockImplementation(passingStore);
});
afterEach(() => {
    Message.prototype.show.mockRestore();
});

describe('Sign in engagement banner', () => {
    describe('With user', () => {
        it('should not show any messages for signed in users', () => {
            getCookie.mockImplementation(name => {
                if (name === '_ga') {
                    return validGaCookie;
                } else if (name === 'GU_U') {
                    return '-';
                }
                return '-';
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(false);
            });
        });
        it('should show messages to signed out users', () => {
            getCookie.mockImplementation(name => {
                if (name === '_ga') {
                    return validGaCookie;
                } else if (name === 'GU_U') {
                    return null;
                }
                return '-';
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(true);
            });
        });
    });

    describe('With recurrent visits', () => {
        it('should not show any messages for visitors who have seen the alert already', () => {
            userPrefs.get.mockImplementation(_ => {
                if (_ === lastSeenAtKey) return timestampToday;
                return passingStore(_);
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(false);
            });
        });
        it('should show it otherwise', () => {
            userPrefs.get.mockImplementation(_ => {
                if (_ === lastSeenAtKey) return timestampThreeDaysAgo;
                return passingStore(_);
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(true);
            });
        });
    });

    describe('With session visits', () => {
        it('should not show any messages for visitors who have seen 1 session articles', () => {
            userPrefs.get.mockImplementation(_ => {
                if (_ === sessionVisitsKey) return 1;
                return passingStore(_);
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(false);
            });
        });
        it('should show it otherwise', () => {
            userPrefs.get.mockImplementation(_ => {
                if (_ === sessionVisitsKey) return 4;
                return passingStore(_);
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(true);
            });
        });
    });

    describe('With lifetime views', () => {
        it('should not show any messages for visitors who have seen the alert 4+ times', () => {
            userPrefs.get.mockImplementation(_ => {
                if (_ === lifeTimeViewsKey) return 4;
                return passingStore(_);
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(false);
            });
        });
        it('should show it otherwise', () => {
            userPrefs.get.mockImplementation(_ => {
                if (_ === lifeTimeViewsKey) return 1;
                return passingStore(_);
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(true);
            });
        });
    });

    describe('With GA cookie', () => {
        it('should not show if the cookie is too new', () => {
            getCookie.mockImplementation(name => {
                if (name === '_ga') {
                    return newGaCookie;
                }
                return null;
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(false);
            });
        });
        it('should show if the cookie is old enough', () => {
            getCookie.mockImplementation(name => {
                if (name === '_ga') {
                    return validGaCookie;
                }
                return null;
            });
            const canShowPr = canShow();
            jest.runAllTimers();
            return canShowPr.then(showable => {
                expect(showable).toBe(true);
            });
        });
    });

    describe('Renders message with', () => {
        it('message text', () => {
            show();
            return expect(Message.prototype.show.mock.calls[0][0]).toMatch(
                /Please sign in/
            );
        });
        it('close button', () => {
            show();
            return expect(Message.prototype.show.mock.calls[0][0]).toMatch(
                new RegExp(bindableClassNames.closeBtn)
            );
        });
    });
});
