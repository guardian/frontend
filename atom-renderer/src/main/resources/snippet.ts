import { Action, Services, Coeval, ComponentType, Try } from "./typedefs"

import { Channel, map, filter, take, tap } from './channels';
import { fromEvent } from './events';

type Atom = {
  atomId: string,
  start: (a: Atom) => Promise<void>;
  stop: () => void;
};

type Snippet = {
  snippetId: string;
  snippetType: string;
  header: HTMLElement;
  question: HTMLElement;
  ack: HTMLElement;
} & Atom;

export default function(componentType: ComponentType) {
  return function({ ophan, dom, viewport }: Services) {
    const AtomBuilder = (root: Element): Coeval<Snippet> => {
      let feedbackC: Channel<Action>;
      let expandC: Channel<Action>;
      let observer: (x: number) => void;

      const start = (a: Snippet): Promise<void> => {
        feedbackC = fromEvent('click', a.question)
        ['->'] (map((e: UIEvent) => (e.target as Element).closest('.atom__button')))
        ['->'] (filter((e: HTMLButtonElement | null) => !!e))
        ['->'] (map((e: HTMLButtonElement) => e.value === 'like' ? Action.LIKE : Action.DISLIKE))
        ['->'] (take(1));
        tap(onFeedback(a))(feedbackC);

        expandC = fromEvent('click', a.header)
        ['->'] (map(_ => Action.EXPAND))
        ['->'] (take(1));
        tap(onExpand(a))(expandC);

        observer = onVisible(a);
        viewport.observe(root, 1, observer);

        return Promise.resolve();
      };
      
      const stop = () => {
        feedbackC.close();
        expandC.close();
        viewport.unobserve(root, 1, observer);
      };
      
      const onFeedback = (p: Snippet) => (a: Action): void => {
        record(p.snippetId, a);
        dom.write(() => {
          p.ack.hidden = false;
          p.question.hidden = true;
        });
      }

      const onExpand = (p: Snippet) => (a: Action): void => {
        record(p.snippetId, a);
      }

      const onVisible = (p: Snippet) => (ratio: number): void => {
        if (ratio >= 1) {
          record(p.snippetId, Action.VIEW);
          viewport.unobserve(root, 1, observer);
        }
      }

      const record = (id: string, action: Action) => {
        ophan.record({
          componentEvent: {
            component: {
              componentType,
              id,
              products: [],
              labels: []
            },
            action
          }
        });
      }
      
      const runTry = (): Try<Snippet> => {
        const header = (root.querySelector('.atom--snippet__header') as HTMLElement);
        const question = (root.querySelector('.atom--snippet__feedback') as HTMLElement);
        const ack = (root.querySelector('.atom--snippet__ack') as HTMLElement);
        const snippet = (root.querySelector('.atom--snippet') as HTMLElement);

        return header && question && ack && snippet
          ? Object.freeze({
            atomId: root.id,
            snippetId: <string>snippet.dataset.snippetId,
            snippetType: <string>snippet.dataset.snippetType,
            header,
            question,
            ack,
            stop,
            start(): Promise<void> {
              return start(this);
            }
          })
          : 'Some elements were missing when initialising atom';
      }

      return Object.freeze({ runTry });
    }

    return AtomBuilder;
  }
}