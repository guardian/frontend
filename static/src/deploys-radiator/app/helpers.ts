import { Option } from 'monapt';

export const headOption = <A>(array: Array<A>): Option<A> => Option(array[0]);
