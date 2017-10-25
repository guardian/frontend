export 
  { Signal
  , constant
  , map
  , flatMap
  , filter
  , apply
  , merge
  , foldp
  , dropRepeats
  };

import { Morphism } from './types';

type Consumer<A> = (a: A) => void;

type Signal<A> = {
  subscribe: Morphism<Consumer<A>, void>;
  get: () => A;
  set: Morphism<A, void>;
};

// Lifts a value in the Signal functor
const make = <A>(a: A): Signal<A> => {
  const subs: Consumer<A>[] = [];
  let val: A = a;

  const subscribe = (s: Consumer<A>) => { 
    subs.push(s); 
    s(val);
  }

  const get = (): A => val;

  const set = (a: A): void => {
    val = a;
    subs.forEach(s => s(a));
  }

  const andThen = <B>(f: Morphism<Signal<A>, Signal<B>>): Signal<B> =>
    f(o);

  const o = Object.freeze({
      subscribe,
      andThen,
      get,
      set
  });

  return o;;
}

// Constant functor
const constant = make;

// Maps incoming signal to a new one
const map = <A, B>(f: Morphism<A ,B>) => (sa: Signal<A>): Signal<B> => {
  const sb = make(f(sa.get()));
  sa.subscribe(a => sb.set(f(a)));
  return sb;
}

// Monadic join of an incoming signal
const flatMap = <A, B>(f: Morphism<A, Signal<B>>) => (sa: Signal<A>): Signal<B> => {
  const sb = f(sa.get());
  sa.subscribe(a => {
    sb.set(f(a).get());
  });
  return sb;
}

// Filters incoming signal.
// Note: requires a zero should the current value not pass the test
const filter = <A>(f: Morphism<A, boolean>) => (z: A) => (sa: Signal<A>): Signal<A> => {
  const ssa = make(f(sa.get()) ? sa.get() : z);
  sa.subscribe(a => {
    if( f(a) )
      ssa.set(a);
  });
  return ssa;
}

// Maps incoming functions from one signal to incoming values of another
const apply = <A, B>(sfa: Signal<Morphism<A, B>>) => (sa: Signal<A>): Signal<B> => {
  const sb = make(sfa.get()(sa.get()));
  sfa.subscribe((f: Morphism<A, B>) => {
    sb.set(f(sa.get()));
  });
  sa.subscribe(a => {
    sb.set(sfa.get()(a));
  });
  return sb;
}

// Merges two signals together
const merge = <A>(sa1: Signal<A>) => (sa2: Signal<A>): Signal<A> => {
  const sa3 = make(sa1.get());
  sa1.subscribe(sa3.set);
  sa2.subscribe(sa3.set);
  return sa3;
}

// Accumulates over incoming values
const foldp = <A, B>(f: Morphism<A, Morphism<B, B>>) => (z: B) => (sa: Signal<A>): Signal<B> => {
  const sb = make(z);
  sa.subscribe(a => {
    sb.set(f(a)(sb.get()));
  });
  return sb;
}

const strictEq = <A>([a1, a2]: [A, A]): boolean => a1 === a2;

// Outputs incoming values so long as they are distinct from one to the next
const dropRepeats = <A>(sa: Signal<A>, eq: Morphism<[A, A], boolean> = strictEq): Signal<A> => {
  const sa2 = make(sa.get());
  sa.subscribe(a => {
    if( !eq([a, sa2.get()]) )
      sa2.set(a);
  });
  return sa2;
}