const storage = {};
const get = (key) => storage[key];
const set = (key, value) => {
    storage[key] = value;
};
const remove = (key) => {
    delete storage[key];
};

export default { get, set, remove };
