// from https://github.com/joonhocho/tsdef
// makes all properties optional recursively, including nested object
type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends Array<infer I>
		? Array<DeepPartial<I>>
		: DeepPartial<T[P]>;
};
