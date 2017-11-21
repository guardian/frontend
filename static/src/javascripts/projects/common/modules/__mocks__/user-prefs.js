// @flow

const storage = {};
const get = (key: string): mixed => storage[key];
const set = (key: string, value: mixed): void => {
    storage[key] = value;
};
const remove = (key: string) => {
    delete storage[key];
};

export default { get, set, remove };
