

const storage = {};
const get = (key: string): unknown => storage[key];
const set = (key: string, value: unknown): void => {
  storage[key] = value;
};
const remove = (key: string) => {
  delete storage[key];
};

export default { get, set, remove };