/**
 * DO NOT EDIT THIS FILE
 *
 * It is not used to to build anything.
 *
 * It's just a record of the old flow types.
 *
 * Use it as a guide when converting
 * - static/src/javascripts/projects/common/modules/ui/notification-counter.spec.js
 * to .ts, then delete it.
 */

// @flow

import mediator from 'lib/mediator';
import { initNotificationCounter } from './notification-counter';

jest.mock('lib/mediator');

describe('notification-counter', () => {
    const ORIGINAL_PAGETITLE = document.title;

    beforeEach(() => {
        document.title = ORIGINAL_PAGETITLE;
        initNotificationCounter();
    });

    it('should show an unread count when modules:autoupdate:unread is fired', () => {
        mediator.emit('modules:autoupdate:unread', 5);
        expect(document.title).toContain('(5)');
    });
});
