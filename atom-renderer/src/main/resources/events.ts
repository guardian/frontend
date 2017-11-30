export
  { fromEvent
  };

import { Channel, chan, putAsync } from './channels';

const fromEvent = (e: string, t: EventTarget): Channel<Event> => {
  const h = (ev: Event) => {
    putAsync(ev)(c);
  };
  const c: Channel<Event> = chan(() => {
    t.removeEventListener(e, h);
  }); 
  t.addEventListener(e, h);
  return c;
}