const storage = {};
const get = (key) => storage[key];
const set = (key, value) => {
    storage[key] = value;
};

export default { get, set };
