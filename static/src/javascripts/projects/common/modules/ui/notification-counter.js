// @flow

import mediator from 'lib/mediator';

const setCount = (count: number, originalTitle: string): void => {
    document.title = count > 0 ? `(${count}) ${originalTitle}` : originalTitle;
};

const initNotificationCounter = (): void => {
    const ORIGINAL_PAGETITLE = document.title;

    mediator.on('modules:autoupdate:unread', count => {
        setCount(count, ORIGINAL_PAGETITLE);
    });
};

export { initNotificationCounter };
