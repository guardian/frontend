import cleanClone from 'utils/clean-clone';

export default function (obj, id) {
    var nuObj = obj ? cleanClone(obj) : {};
    nuObj.id = id;
    return nuObj;
}
