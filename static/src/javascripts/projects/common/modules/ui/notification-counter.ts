

import mediator from "lib/mediator";

const setCount = (count: number, title: string): void => {
  document.title = count > 0 ? `(${count}) ${title}` : title;
};

const initNotificationCounter = (): void => {
  const ORIGINAL_PAGETITLE = document.title;

  mediator.on('modules:autoupdate:unread', count => {
    setCount(count, ORIGINAL_PAGETITLE);
  });
};

export { initNotificationCounter };