const storage: Record<string, unknown> = {};
const get = (key: string): unknown => storage[key];
const set = (key: string, value: unknown): void => {
	storage[key] = value;
};
const remove = (key: string): void => {
	delete storage[key];
};

// eslint-disable-next-line import/no-default-export -- Permit this here
export default { get, set, remove };
