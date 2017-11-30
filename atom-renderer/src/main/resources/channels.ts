export 
  { Channel
  , chan
  , putAsync
  , takeAsync
  , map
  , filter
  , apply
  , merge
  , dropRepeats
  , take
  , drop
  , tap
  };

import { Morphism } from './types';

type Channel<A> = {
  take:     () => TakeResult<A>;
  put:      (a: A) => PutResult<A>;
  canPut:   () => boolean;
  canTake:  () => boolean;
  '->':     <B>(f: Morphism<Channel<A>, Channel<B>>) => Channel<B>;
  close:    () => void;
  isClosed: boolean;
};

type Resume<A> = ['resume', A];
type Park<A>   = ['park', A];

type PutResult<A> = Resume<boolean>
                  | Park<A | null>;

type TakeResult<A> = Resume<A | null>
                   | Park<null>;

const chan = <A>(onClose?: () => void): Channel<A> => {
  let isClosed = false;
  let val: A | null;

  const take = (): TakeResult<A> => {
    if( canTake() ) {
      const ret: A = val as A;
      val = null;
      return ['resume', ret];
    } else if( isClosed ) {
      return ['resume', null];
    } else {
      return ['park', null];
    }
  }

  const put = (a: A): PutResult<A> => {
    if( isClosed ) {
      return ['resume', false];
    } else if( canPut() ) {
      val = a;
      return ['resume', true];
    } else {
      return ['park', null];
    }
  };

  const canPut = (): boolean => true;
  const canTake = (): boolean => !!val;
  const close = (): void => { 
    if (!isClosed) {
      if (onClose) {
        onClose();
      }
      isClosed = true;
    }
  };

  const andThen = <B>(f: Morphism<Channel<A>, Channel<B>>): Channel<B> =>
    f(c);

  const c: Channel<A> = Object.freeze({
    take,
    put,
    canPut,
    canTake,
    '->': andThen,
    close,
    isClosed
  });

  return c;
}

const putAsync = <A>(a: A) => (c: Channel<A>): Promise<boolean> =>
  new Promise(resolve => {
    const tryPut = () => {
      const res: PutResult<A> = c.put(a);
      if (res[0] === 'resume')
        resolve((<Resume<boolean>>res)[1]);
      else
        setTimeout(tryPut, 0);
    }
    tryPut();
  });

const takeAsync = <A>(c: Channel<A>): Promise<A | null> =>
  new Promise(resolve => {
    const tryTake = () => {
      const res: TakeResult<A> = c.take();
      if( res[0] === 'resume' )
        resolve((<Resume<A | null>>res)[1]);
      else
        setTimeout(tryTake, 0);
    }
    tryTake();
  });

// Maps incoming Channel to a new one
const map = <A, B>(f: Morphism<A ,B>) => (ca: Channel<A>): Channel<B> => {
  const cb: Channel<B> = chan();
  const map_rec = () => {
    takeAsync(ca).then(a => {
      if (a === null)
        cb.close();
      else {
        cb.put(f(a));
        map_rec();
      }
    });
  }
  map_rec();
  return cb;
}

// Filters incoming Channel.
// Note: requires a zero should the current value not pass the test
const filter = <A>(f: Morphism<A, boolean>) => (ca: Channel<A>): Channel<A> => {
  const ca2: Channel<A> = chan();
  const filter_rec = () => {
    takeAsync(ca).then(a => {
      if( a === null )
        ca2.close();
      else {
        if( f(a) ) ca2.put(a);
        filter_rec();
      }
    });
  }
  filter_rec();
  return ca2;
}

// Maps incoming functions from one Channel to incoming values of another
const apply = <A, B>(cfa: Channel<Morphism<A, B>>) => (ca: Channel<A>): Channel<B> => {
  const cb: Channel<B> = chan();
  const apply_rec = () => {
    Promise.all([
      takeAsync(cfa),
      takeAsync(ca)
    ]).then(([f, a]) => {
      if( f === null || a === null )
        cb.close();
      else {
        cb.put(f(a));
        apply_rec();
      }
    });
  }
  apply_rec();
  return cb;
}

// Merges two Channels together
const merge = <A>(ca1: Channel<A>) => (ca2: Channel<A>): Channel<A> => {
  const ca3: Channel<A> = chan();
  const merge_rec = (ca: Channel<A>) => {
    takeAsync(ca).then(a => {
      if( a === null )
        null
      else {
        ca3.put(a);
        merge_rec(ca);
      }
    });
  }
  merge_rec(ca1);
  merge_rec(ca2);
  return ca3;
}

const strictEq = <A>([a1, a2]: [A, A]): boolean => a1 === a2;

// Outputs incoming values so long as they are distinct from one to the next
const dropRepeats = <A>(ca: Channel<A>, eq: Morphism<[A, A], boolean> = strictEq): Channel<A> => {
  const ca2: Channel<A> = chan();
  let aa: A;
  const drop_rec = () => {
    takeAsync(ca).then(a => {
      if( a === null )
        ca2.close();
      else {
        if( !eq([a, aa]) )
          ca2.put(a);
        drop_rec();
      }
    });
  }
  drop_rec();
  return ca2;
}

const take = <A>(n: number) => (ca: Channel<A>): Channel<A> => {
  const ca2: Channel<A> = chan();
  const take_rec = (n: number) => {
    if( n === 0 )
      ca2.close();
    else
      takeAsync(ca).then(a => {
        if( a === null )
          ca2.close();
        else {
          ca2.put(a);
          take_rec(n - 1);
        }
      });
  }
  take_rec(n);
  return ca2;
}

const drop = <A>(n: number) => (ca: Channel<A>): Channel<A> => {
  const ca2: Channel<A> = chan();
  const drop_rec = (n: number) => {
    takeAsync(ca).then(a => {
      if( a === null )
        ca2.close();
      else {
        if( n === 0 ) {
          ca2.put(a);
          drop_rec(0);
        } else
          drop_rec(n - 1);
      }
    });
  }
  drop_rec(n);
  return ca2;
}

const tap = <A>(f: Morphism<A, void>) => (ca: Channel<A>): void => {
  const tap_rec = () => {
    takeAsync(ca).then(a => {
      if( a === null )
        return;
      f(a);
      tap_rec();
    });
  }
  tap_rec();
}