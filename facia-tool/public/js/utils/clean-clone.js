export default function(obj) {
    return obj === undefined ? undefined : JSON.parse(JSON.stringify(obj));
}
